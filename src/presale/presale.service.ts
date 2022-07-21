import Web3 from 'web3'
import * as U from 'web3-utils'
import { EncryptedKeystoreV3Json } from 'web3-core'
import PresaleJson from '../common/contracts/build/Presale.json'
import LockerJson from '../common/contracts/build/Locker.json'
import Erc20Json from '../common/contracts/build/IERC20.json'
import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppConfigService } from 'src/app-config/app-config.service'
import { WalletService } from 'src/wallet/wallet.service'
import { User } from 'src/users/models/users.model'
import { FeesDto } from './dto/fees.dto'
import { StartDto } from './dto/start.dto'
import { ByTokenDto } from './dto/byToken.dto'
import { ByAddressDto } from './dto/byAddress.dto'
import { ByWithdrawalDto } from './dto/byWithdrawal.dto'
import { DepositDto } from './dto/deposit.dto'
import { SpecificDto } from './dto/specific.dto'
import { EmergencyDto } from './dto/emergency.dto'
import { RenewDto } from './dto/renew.dto'
import { LockManyDto } from './dto/lockMany.dto'
import { LockOneDto } from './dto/lockOne.dto'
import { DeployDto } from './dto/deploy.dto'

@Injectable()
export class PresaleService {
    private w3m: Web3
    private w3t: Web3

    constructor(
        private configService: ConfigService,
        private appConfigService: AppConfigService,
        private walletService: WalletService,
    ) {
        this.w3t = new Web3(new Web3.providers.HttpProvider(configService.get('POLYGON_TESTNET')))
        this.w3m = new Web3(new Web3.providers.HttpProvider(configService.get('POLYGON_MAINNET')))
    }

    async deploy(user: User, body: DeployDto) {
        try {
            const appConfig = await this.appConfigService.getConfiguration()
            const w3 = appConfig.mode === 'mainnet' ? this.w3m : this.w3t
            const presale = new w3.eth.Contract(PresaleJson.abi as U.AbiItem[])
            const locker = new w3.eth.Contract(LockerJson.abi as U.AbiItem[])

            const address = await this.walletService.getUserWallet(user.id, body.dev, 'eth')

            if (!address) {
                throw new HttpException('Address not found', HttpStatus.OK)
            }

            const account = w3.eth.accounts.decrypt(
                address.keystore as EncryptedKeystoreV3Json,
                await this.configService.get('DEFAULT_PASSWORD'),
            )

            const presaleData = presale.deploy({ data: PresaleJson.bytecode, arguments: [body.router] })
            const lockerData = locker.deploy({ data: LockerJson.bytecode })
            const presaleDeploy = await this.deployTx({ w3, presale }, account, presaleData)
            const lockerDeploy = await this.deployTx({ w3, locker }, account, lockerData)

            await this.appConfigService.updateConfiguration({
                locker: lockerDeploy.contractAddress,
                presale: presaleDeploy.contractAddress,
            })

            presale.options.address = presaleDeploy.contractAddress

            await this.appConfigService.addToken({
                chainId: await w3.eth.net.getId(),
                contractAddress: await presale.methods.charityToken().call(),
                decimals: 18,
                symbol: 'CHAT',
                name: 'CharityToken',
            })

            return {
                presaleDeploy,
                lockerDeploy,
            }
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async start(user: User, body: StartDto) {
        try {
            const env = await this.getPresaleEnv()
            const account = await this.getAccount(env, user)
            const values = Object.values({
                ...body,
                min: U.toWei(body.min.toString(), 'ether'),
                max: U.toWei(body.max.toString(), 'ether'),
                total: U.toWei(body.total.toString(), 'ether'),
                hardCap: U.toWei(body.hardCap.toString(), 'ether'),
            })
            const data = env.contract.methods.startPresale(...values)

            return await this.sendTx(env, account, data)
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async end(user: User) {
        try {
            const env = await this.getPresaleEnv()
            const account = await this.getAccount(env, user)
            const data = env.contract.methods.endPresale()

            return await this.sendTx(env, account, data)
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async liquidity(user: User) {
        try {
            const env = await this.getPresaleEnv()
            const account = await this.getAccount(env, user)
            const data = env.contract.methods.addLiquidityToPool()

            const result = await this.sendTx(env, account, data)

            await this.appConfigService.addToken({
                chainId: await env.w3.eth.net.getId(),
                contractAddress: await env.contract.methods.uniswapV2Pair().call(),
                decimals: 18,
                symbol: 'UNI-V2',
                name: 'Liquidity Provider Tokens',
            })

            return result
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async fees(user: User, body: FeesDto) {
        try {
            const env = await this.getPresaleEnv()
            const account = await this.getAccount(env, user)
            const values = Object.values(body)
            const data = env.contract.methods.setFees(...values)

            return await this.sendTx(env, account, data)
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async withdrawDev(user: User) {
        try {
            const env = await this.getPresaleEnv()
            const account = await this.getAccount(env, user)
            const data = env.contract.methods.withdrawDevEth()

            return await this.sendTx(env, account, data)
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async withdrawTokens(user: User) {
        try {
            const env = await this.getPresaleEnv()
            const account = await this.getAccount(env, user)
            const data = env.contract.methods.withdrawTokens()

            return await this.sendTx(env, account, data)
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async withdrawLiquidity(user: User) {
        try {
            const env = await this.getPresaleEnv()
            const account = await this.getAccount(env, user)
            const data = env.contract.methods.withdrawLiquidity()

            return await this.sendTx(env, account, data)
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async data() {
        try {
            const appConfig = await this.appConfigService.getConfiguration()
            const w3 = appConfig.mode === 'mainnet' ? this.w3m : this.w3t
            const presale = new w3.eth.Contract(PresaleJson.abi as U.AbiItem[], appConfig.presale)
            const charityToken = await presale.methods.charityToken().call()
            const erc20 = new w3.eth.Contract(Erc20Json.abi as U.AbiItem[], charityToken)
            const maticBalance = await w3.eth.getBalance(presale.options.address)
            const tokenBalance = await erc20.methods.balanceOf(presale.options.address).call()
            const owner = await presale.methods.owner().call()
            const isActive = await presale.methods.isActive().call()
            const maxInvestment = await presale.methods.maxInvestment().call()
            const minInvestment = await presale.methods.minInvestment().call()
            const maxInvestmentTotal = await presale.methods.maxInvestmentTotal().call()
            const cap = await presale.methods.cap().call()
            const poolRate = await presale.methods.poolRate().call()
            const presaleInfo = await presale.methods.presaleInfo().call()
            const saleRate = await presale.methods.saleRate().call()
            const uniswapV2Pair = await presale.methods.uniswapV2Pair().call()
            const uniswapV2Router = await presale.methods.uniswapV2Router().call()
            const unlockLiquidity = await presale.methods.unlockLiquidity().call()

            return {
                presaleContract: presale.options.address,
                charityToken,
                presaleInfo,
                presaleStatus: isActive,
                hardCap: U.fromWei(cap, 'ether'),
                maticBalance: U.fromWei(maticBalance, 'ether'),
                tokenBalance: U.fromWei(tokenBalance, 'ether'),
                minInvestment: U.fromWei(minInvestment, 'ether'),
                maxInvestment: U.fromWei(maxInvestment, 'ether'),
                maxInvestmentTotal: U.fromWei(maxInvestmentTotal, 'ether'),
                saleRate,
                poolRate,
                unlockLiquidity: new Date(unlockLiquidity * 1000),
                owner,
                uniswapV2Pair,
                uniswapV2Router,
            }
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async deposits() {
        try {
            const env = await this.getPresaleEnv()

            const deposits = await env.contract.getPastEvents('Received', {
                fromBlock: 0,
                toBlock: 'latest',
            })

            const totalDepositsCount = deposits.length

            const totalInvestmentsMatic = deposits.reduce((previousValue, currentValue) => {
                const value = U.fromWei(currentValue.returnValues.eth, 'ether')
                return (previousValue += +value)
            }, 0)

            const totalTokensPaid = deposits.reduce((previousValue, currentValue) => {
                const value = U.fromWei(currentValue.returnValues.tokens, 'ether')
                return (previousValue += +value)
            }, 0)

            const investorsArray = deposits.map((item) => item.returnValues.from)
            const uniqueInvestors = new Set(investorsArray).size

            return {
                totalDepositsCount,
                totalInvestmentsMatic,
                totalTokensPaid,
                uniqueInvestors,
                deposits,
            }
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async lockOne(user: User, body: LockOneDto) {
        try {
            const env = await this.getLockerEnv()
            const account = await this.getAccount(env, user)
            body._amount = U.toWei(body._amount, 'ether')

            await this.approve(env, account, {
                tokenAddress: body._tokenAddress,
                totalAmount: body._amount,
            })

            const values = Object.values(body)
            const data = env.contract.methods.lockTokens(...values)

            return await this.sendTx(env, account, data)
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async lockMany(user: User, body: LockManyDto) {
        try {
            const env = await this.getLockerEnv()
            const account = await this.getAccount(env, user)
            const totalAmount = body._amounts.reduce((prev, curr) => +prev + +curr, 0)
            body._amounts = body._amounts.map((amount) => U.toWei(amount, 'ether'))

            await this.approve(env, account, {
                tokenAddress: body._tokenAddress,
                totalAmount: U.toWei(totalAmount.toString(), 'ether'),
            })

            const values = Object.values(body)
            const data = env.contract.methods.lockTokenMultiple(...values)

            return await this.sendTx(env, account, data)
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async renew(user: User, body: RenewDto) {
        try {
            const env = await this.getLockerEnv()
            const account = await this.getAccount(env, user)
            const values = Object.values(body)
            const data = env.contract.methods.renewLock(...values)

            return await this.sendTx(env, account, data)
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async regular(user: User, body: DepositDto) {
        try {
            const env = await this.getLockerEnv()
            const account = await this.getAccount(env, user)
            const values = Object.values(body)
            const data = env.contract.methods.withdrawDeposit(...values)

            return await this.sendTx(env, account, data)
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async emergency(user: User, body: EmergencyDto) {
        try {
            const env = await this.getLockerEnv()
            const account = await this.getAccount(env, user)
            const values = Object.values(body)
            const data = env.contract.methods.emergencyWithdrawTokens(...values)

            return await this.sendTx(env, account, data)
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async specific(user: User, body: SpecificDto) {
        try {
            const env = await this.getLockerEnv()
            const account = await this.getAccount(env, user)
            const values = Object.values(body)
            const data = env.contract.methods.withdrawSpecificDeposit(...values)

            return await this.sendTx(env, account, data)
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async epoch() {
        try {
            const env = await this.getLockerEnv()
            return await env.contract.methods.getCurrentEpochtime().call()
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async depositsIds() {
        try {
            const env = await this.getLockerEnv()
            return await env.contract.methods.getAllDepositIds().call()
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async details(param: DepositDto) {
        try {
            const env = await this.getLockerEnv()
            return await env.contract.methods.getDepositDetails(param._id).call()
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async byToken(param: ByTokenDto) {
        try {
            const env = await this.getLockerEnv()
            return await env.contract.methods.getDepositsByTokenAddress(param._tokenAddress).call()
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async byWithdrawal(param: ByWithdrawalDto) {
        try {
            const env = await this.getLockerEnv()
            return await env.contract.methods.getDepositsByWithdrawalAddress(param._withdrawalAddress).call()
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async byAddress(body: ByAddressDto) {
        try {
            const env = await this.getLockerEnv()
            return await env.contract.methods.getTokenBalanceByAddress(body._tokenAddress, body._walletAddress).call()
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async total(param: ByTokenDto) {
        try {
            const env = await this.getLockerEnv()
            return await env.contract.methods.getTotalTokenBalance(param._tokenAddress).call()
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getPresaleEnv() {
        try {
            const appConfig = await this.appConfigService.getConfiguration()
            const w3 = appConfig.mode === 'mainnet' ? this.w3m : this.w3t
            const contract = new w3.eth.Contract(PresaleJson.abi as U.AbiItem[], appConfig.presale)

            return {
                w3,
                contract,
            }
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getLockerEnv() {
        try {
            const appConfig = await this.appConfigService.getConfiguration()
            const w3 = appConfig.mode === 'mainnet' ? this.w3m : this.w3t
            const contract = new w3.eth.Contract(LockerJson.abi as U.AbiItem[], appConfig.locker)

            return {
                w3,
                contract,
            }
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async approve(env, account, values) {
        try {
            const erc20Contract = new env.w3.eth.Contract(Erc20Json.abi as U.AbiItem[], values.tokenAddress)
            const approveData = erc20Contract.methods.approve(env.contract.options.address, values.totalAmount)
            return await this.sendTx({ w3: env.w3, contract: erc20Contract }, account, approveData)
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getAccount(env, user) {
        try {
            const owner = await env.contract.methods.owner().call()
            const address = await this.walletService.getUserWallet(user.id, owner, 'eth')

            if (!address) {
                throw new HttpException('Address not found', HttpStatus.OK)
            }

            return await env.w3.eth.accounts.decrypt(
                address.keystore as EncryptedKeystoreV3Json,
                await this.configService.get('DEFAULT_PASSWORD'),
            )
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async sendTx(env, account, data) {
        try {
            const tx = {
                nonce: await env.w3.eth.getTransactionCount(account.address),
                from: account.address,
                to: env.contract.options.address,
                gas: await data.estimateGas({ from: account.address, value: 0 }),
                maxPriorityFeePerGas: await env.w3.eth.getGasPrice(),
                data: data.encodeABI(),
                value: 0,
            }

            const comission = +tx.gas * +tx.maxPriorityFeePerGas
            const balance = await env.w3.eth.getBalance(account.address)
            if (+balance < comission) {
                throw new HttpException('Not enough MATIC balance', HttpStatus.OK)
            }

            const signed = await account.signTransaction(tx)
            return await env.w3.eth.sendSignedTransaction(signed.rawTransaction)
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async deployTx(env, account, data) {
        try {
            const tx = {
                nonce: await env.w3.eth.getTransactionCount(account.address),
                from: account.address,
                gas: await data.estimateGas({ from: account.address, value: 0 }),
                maxPriorityFeePerGas: await env.w3.eth.getGasPrice(),
                data: data.encodeABI(),
                value: 0,
            }

            const comission = +tx.gas * +tx.maxPriorityFeePerGas
            const balance = await env.w3.eth.getBalance(account.address)
            if (+balance < comission) {
                throw new HttpException('Not enough MATIC balance', HttpStatus.OK)
            }

            const signed = await account.signTransaction(tx)
            return await env.w3.eth.sendSignedTransaction(signed.rawTransaction)
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
