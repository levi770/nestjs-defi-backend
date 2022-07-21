import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/sequelize'
import { UserWallet } from './models/user-wallet.model'
import { User } from 'src/users/models/users.model'
import { ReceiveDto } from './dto/receive.dto'
import EthereumQRPlugin from 'ethereum-qr-code'
import { TransferDto } from './dto/transfer.dto'
import { ContactDto } from './dto/contact.dto'
import { PaginateDto } from 'src/common/dto/paginate.dto'
import { UserAddressDto } from './dto/userAddress.dto'
import { AppConfigService } from 'src/app-config/app-config.service'
import { Contact } from './models/contacts.model'
import { fn, col, cast, Op } from 'sequelize'
import axios from 'axios'
import Web3 from 'web3'
import { EncryptedKeystoreV3Json } from 'web3-core'
import U from 'web3-utils'
import Erc20_json from '../common/contracts/build/IERC20.json'
import Organization_json from '../common/contracts/build/Organization.json'
import Factory_json from '../common/contracts/build/CharityFactory.json'
import CharityToken_json from '../common/contracts/build/CharityToken.json'
import SwapRouter_json from '../common/contracts/build/IUniswapV2Router02.json'
import { Transfer } from './models/transfer.model'
import { DonationDto } from './dto/donation.dto'
import { LabelDto } from './dto/label.dto'
import { RewardsQueryDto } from './dto/rewards-query.dto'
import { Reward } from './models/rewards.model'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { TransferFilterDto } from './dto/transfer-filter.dto'
import { TxPayload } from './interfaces/tx.interface'
import { GetTransferDto } from './dto/get-transfer.dto'
import { ExtToken } from 'src/app-config/models/ext-tokens.model'
import { SwapTokensDto } from './dto/swap.dto'
import { SwapsFilterDto } from './dto/swaps-filter.dto'
import { SwapIdDto } from './dto/swap-id.dto'
import { Swap } from './models/swaps.model'
import { TxSatatusIdDto } from './dto/txstatus-id.dto'
import { CurrentDto } from './dto/current.dto'

@Injectable()
export class WalletService {
    private mn: Web3
    private tn: Web3

    constructor(
        private configService: ConfigService,
        private appConfigService: AppConfigService,
        @InjectModel(UserWallet) private userWalletRepo: typeof UserWallet,
        @InjectModel(Contact) private contactsRepo: typeof Contact,
        @InjectModel(Transfer) private transfersRepo: typeof Transfer,
        @InjectModel(Reward) private rewardsRepo: typeof Reward,
        @InjectModel(Swap) private swapRepo: typeof Swap,
        @InjectQueue('cron') private cronQueue: Queue,
    ) {
        this.tn = new Web3(new Web3.providers.HttpProvider(configService.get('POLYGON_TESTNET')))
        this.mn = new Web3(new Web3.providers.HttpProvider(configService.get('POLYGON_MAINNET')))
    }

    //#region Address

    async createNewAccount(user: User) {
        try {
            const mode = (await this.appConfigService.getConfigurationItem('mode')).mode
            const _chain: Web3 = mode === 'mainnet' ? this.mn : this.tn

            const password = await this.configService.get('DEFAULT_PASSWORD')
            const account = _chain.eth.accounts.create()
            const keystore = account.encrypt(password)

            await user.$create('user_wallet', {
                type: 'eth',
                address: account.address,
                keystore,
            })
            await user.save()

            return 'New wallet created'
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getNewAccount() {
        const mode = (await this.appConfigService.getConfigurationItem('mode')).mode
        const _chain: Web3 = mode === 'mainnet' ? this.mn : this.tn

        const password = await this.configService.get('DEFAULT_PASSWORD')
        const account = _chain.eth.accounts.create()
        const keystore = account.encrypt(password)

        return {
            type: 'eth',
            address: account.address,
            keystore,
        }
    }

    async addUserAddress(user: User, address: UserAddressDto) {
        try {
            await user.$create('user_wallet', { type: 'ext', address: address.address })
            await user.save()

            return 'Address added'
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getWalletByString(wallet: string) {
        return this.userWalletRepo.findOne({ where: { address: wallet } })
    }

    async getUserWalletByString(id: string, wallet: string) {
        return this.userWalletRepo.findOne({ where: { userId: id, address: wallet } })
    }

    async getUserWallet(userId: string, address: string, type: string) {
        return this.userWalletRepo.findOne({ where: { userId, address, type } })
    }

    async getAllAdresses(id: string) {
        return await this.userWalletRepo.findAll({ where: { userId: id } })
    }

    async updateLabel(user: User, userAddress: UserAddressDto, body: LabelDto) {
        try {
            const address = await this.userWalletRepo.findOne({
                where: { userId: user.id, address: userAddress.address },
            })

            const result = await this.userWalletRepo.update({ label: body.label }, { where: { id: address.id } })

            return result
        } catch (error) {
            throw new HttpException('Address not found', HttpStatus.OK)
        }
    }

    async deleteAdress(user: User, address: string) {
        try {
            const userAddress = await this.userWalletRepo.findOne({
                where: { userId: user.id, address },
            })

            const result = await this.userWalletRepo.destroy({
                where: { id: userAddress.id },
            })

            return result
        } catch (error) {
            throw new HttpException('Address not found', HttpStatus.OK)
        }
    }

    //#endregion

    //#region Balance

    async getBalance(user: User, address: string) {
        const userAddress = await this.userWalletRepo.findOne({
            where: { userId: user.id, address },
        })

        if (!userAddress) {
            throw new HttpException('Address not found', HttpStatus.INTERNAL_SERVER_ERROR)
        }

        const conn = await this.getConnection()
        const tokens = (await this.appConfigService.getAllTokensByNetwork({ chainId: conn.chainId })).rows
        const matic_usd_price = +tokens.find((x) => x.symbol === 'WMATIC').latest_usdc_price

        let token_balance = null
        let usd_balance = 0

        if (tokens) {
            token_balance = await Promise.all(
                tokens.map(async (token: ExtToken) => {
                    const contract = new conn.w3.eth.Contract(Erc20_json.abi as U.AbiItem[], token.contractAddress)
                    const contract_balance = +U.fromWei(
                        await contract.methods.balanceOf(userAddress.address).call(),
                        'ether',
                    )
                    const contract_usd_balance =
                        token.latest_usdc_price != 0
                            ? contract_balance * token.latest_usdc_price
                            : token.latest_matic_price != 0
                            ? contract_balance * (token.latest_matic_price * matic_usd_price)
                            : 0

                    usd_balance += contract_usd_balance

                    return {
                        symbol: token.symbol,
                        token_currency_balance: contract_balance,
                        token_usd_balance: contract_usd_balance,
                    }
                }),
            )
        }

        const matic_currency_balance = +U.fromWei(await conn.w3.eth.getBalance(userAddress.address), 'ether')
        const matic_usd_balance = matic_currency_balance * matic_usd_price

        usd_balance += matic_usd_balance

        return {
            total_usd_balance: usd_balance,
            main_currency: { matic_currency_balance, matic_usd_balance },
            tokens: token_balance,
        }
    }

    async getBalanceChanges(address: string, currency: string, from: Date) {
        const opts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': process.env.BITQUERY_API_KEY,
            },
        }

        const query = `
        query (
            $network: EthereumNetwork!, 
            $address: String!, 
            $inboundDepth: Int!, 
            $outboundDepth: Int!, 
            $limit: Int!, 
            $currency: String!, 
            $from: ISO8601DateTime, 
            $till: ISO8601DateTime
        ) {
            ethereum(network: $network) {
                inbound: coinpath(
                    initialAddress: {is: $address}
                    currency: {is: $currency}
                    depth: {lteq: $inboundDepth}
                    options: {direction: inbound, asc: "depth", desc: "amount", limitBy: {each: "depth", limit: $limit}}
                    date: {since: $from, till: $till}
                ) {
                    amount
                    currency {
                        symbol
                    }
                    depth
                    count
                }
                outbound: coinpath(
                    initialAddress: {is: $address}
                    currency: {is: $currency}
                    depth: {lteq: $outboundDepth}
                    options: {asc: "depth", desc: "amount", limitBy: {each: "depth", limit: $limit}}
                    date: {since: $from, till: $till}
                ) {
                    amount
                    currency {
                        symbol
                    }
                    depth
                    count
                }
            }
        }
    `

        const variables = {
            inboundDepth: 1,
            outboundDepth: 1,
            limit: 100,
            offset: 0,
            network: 'matic',
            address,
            currency,
            from,
            till: null,
            dateFormat: '%Y-%m',
        }

        opts['body'] = JSON.stringify({ query, variables })

        const url = process.env.BITQUERY_API_URL

        try {
            const result = await (await fetch(url, opts)).json()
            return result.data.ethereum
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getBalanceInOut(address: string, contractaddress: string, from: Date) {
        const conn = await this.getConnection()
        const endpoint =
            conn.mode === 'mainnet'
                ? this.configService.get('POLYGONSCAN_MAINNET')
                : this.configService.get('POLYGONSCAN_TESTNET')

        const apikey = this.configService.get('POLYGONSCAN_APIKEY')
        const timestamp = Math.floor(Date.parse(from.toISOString()) / 1000)

        const start_block_data = {
            module: 'block',
            action: 'getblocknobytime',
            timestamp,
            closest: 'before',
            apikey,
        }

        const token_tx_data = {
            module: 'account',
            action: 'tokentx',
            contractaddress,
            address,
            apikey,
        }

        const start_block_url = Object.entries(start_block_data).reduce((prev, curr) => {
            return prev + `${curr[0]}=${curr[1]}&`
        }, `${endpoint}api?`)

        const token_tx_url = Object.entries(token_tx_data).reduce((prev, curr) => {
            return prev + `${curr[0]}=${curr[1]}&`
        }, `${endpoint}api?`)

        const start_block = (await axios.get(start_block_url)).data.result
        const token_tx = (await axios.get(token_tx_url)).data.result

        const in_tx = token_tx.reduce((prev: any, curr: any) => {
            if (curr.to.toLowerCase() === address.toLowerCase() && +curr.blockNumber >= +start_block) {
                prev += +U.fromWei(curr.value, 'ether')
            }

            return prev
        }, 0)

        const out_tx = token_tx.reduce((prev: any, curr: any) => {
            if (curr.from.toLowerCase() === address.toLowerCase() && +curr.blockNumber >= +start_block) {
                prev += +U.fromWei(curr.value, 'ether')
            }

            return prev
        }, 0)

        return { in: in_tx, out: out_tx }
    }

    //#endregion

    //#region Rewards

    async getRewards(user: User, address: string, tokenFor: string) {
        const conn = await this.getConnection()

        const userAddress = await this.userWalletRepo.findOne({
            where: { userId: user.id, address, type: 'eth' },
        })

        if (!userAddress) {
            throw new HttpException('Address not found', HttpStatus.OK)
        }

        const token = await this.appConfigService.getOneTokenBySymbolByNetwork(tokenFor, conn.chainId)
        if (!token) throw new HttpException('Token not found', HttpStatus.OK)

        const contract = new conn.w3.eth.Contract(CharityToken_json.abi as U.AbiItem[], token.contractAddress)
        const tokenBalance = await contract.methods.balanceOf(address).call()
        if (tokenBalance === '0') throw new HttpException('No balance', HttpStatus.OK)

        const balanceInOut = await this.getBalanceInOut(
            userAddress.address,
            token.contractAddress,
            userAddress.createdAt,
        )

        const balance = +U.fromWei(tokenBalance, 'ether')
        let txDelta = balance
        if (balanceInOut.in != 0 || balanceInOut.out != 0) {
            txDelta = balanceInOut.in - balanceInOut.out
        }

        const reflections = balance - txDelta
        //const totalFees = U.fromWei(await contract.methods.totalFees().call(), 'ether')

        return {
            txDelta,
            reflections,
            tokenBalance: balance,
            //totalFees: +totalFees,
        }
    }

    async getRewardsHistory(user: User, address: string, symbol: string, paginate: RewardsQueryDto) {
        const conn = await this.getConnection()

        const userAddress = await this.userWalletRepo.findOne({
            where: { userId: user.id, address, type: 'eth' },
        })

        if (!userAddress) {
            throw new HttpException('Address not found', HttpStatus.OK)
        }

        const token = await this.appConfigService.getOneTokenBySymbolByNetwork(symbol, conn.chainId)

        if (!token) {
            throw new HttpException('Token not found', HttpStatus.OK)
        }

        const from_date = new Date()

        switch (paginate.period) {
            case 'day':
                from_date.setDate(from_date.getDate() - 1)
                break

            case 'week':
                from_date.setDate(from_date.getDate() - 7)
                break

            case 'month':
                from_date.setDate(from_date.getDate() - 30)
                break

            case 'quarter':
                from_date.setDate(from_date.getDate() - 90)
                break

            case 'half':
                from_date.setDate(from_date.getDate() - 180)
                break

            case 'year':
                from_date.setDate(from_date.getDate() - 365)
                break

            case 'all':
                return await this.rewardsRepo.findAll({
                    where: {
                        userId: user.id,
                        walletId: userAddress.id,
                        tokenId: token.id,
                    },
                })
        }

        return await this.rewardsRepo.findAll({
            where: {
                userId: user.id,
                walletId: userAddress.id,
                tokenId: token.id,
                createdAt: { [Op.gte]: from_date },
            },
        })
    }

    //#endregion

    //#region Transactions

    async receive(user: User, toAddress: string, receive: ReceiveDto) {
        const userAddress = await this.userWalletRepo.findOne({
            where: { userId: user.id, address: toAddress },
        })

        if (!userAddress) {
            throw new HttpException('Address not found', HttpStatus.OK)
        }

        const mode = (await this.appConfigService.getConfigurationItem('mode')).mode
        const _chain: Web3 = mode === 'mainnet' ? this.mn : this.tn
        const chainId = await _chain.eth.getChainId()

        const qr = new EthereumQRPlugin()
        let txData = null

        if (receive.token === 'ETH') {
            txData = {
                to: toAddress,
                value: receive.amount,
                chainId,
            }
        } else {
            const token = await this.appConfigService.getOneTokenBySymbolByNetwork(receive.token, chainId)

            if (!token) throw new HttpException('Token not found', HttpStatus.OK)

            txData = {
                to: token.contractAddress,
                mode: 'erc20__transfer',
                argsDefaults: [
                    {
                        name: 'to',
                        value: toAddress,
                    },
                    {
                        name: 'value',
                        value: receive.amount,
                    },
                ],
            }
        }

        return await qr.toDataUrl(txData)
    }

    async transferExt(user: User, userAddress: string, transfer: TransferDto) {
        const conn = await this.getConnection()

        const tx: TxPayload = {}
        let balance: string
        let transferAmount: string

        try {
            if (transfer.token != 'MATIC') {
                const token = await this.appConfigService.getOneTokenBySymbolByNetwork(transfer.token, conn.chainId)
                if (!token) throw new HttpException('Token not found', HttpStatus.OK)

                const erc20Contract = new conn.w3.eth.Contract(Erc20_json.abi as U.AbiItem[], token.contractAddress)
                balance = await erc20Contract.methods.balanceOf(userAddress).call()
                transferAmount = U.toWei(transfer.amount, token.decimals === 18 ? 'ether' : 'gwei')
                const data = erc20Contract.methods.transfer(transfer.to, transferAmount)

                tx.to = token.contractAddress
                tx.gas = await data.estimateGas({ from: userAddress, value: 0 })
                tx.data = data.encodeABI()
                tx.value = 0
            } else {
                balance = await conn.w3.eth.getBalance(userAddress)
                transferAmount = U.toWei(transfer.amount, 'ether')

                tx.to = transfer.to
                tx.gas = await conn.w3.eth.estimateGas({
                    from: userAddress,
                    to: transfer.to,
                    value: transferAmount,
                })
                tx.value = +transferAmount
            }

            tx.nonce = await conn.w3.eth.getTransactionCount(userAddress)
            tx.maxPriorityFeePerGas = +(await conn.w3.eth.getGasPrice())
            tx.from = userAddress
            tx.chainId = conn.chainId

            const comission = U.fromWei((tx.gas * tx.maxPriorityFeePerGas).toFixed(0), 'ether')

            if (+balance < +transferAmount + +comission) {
                throw new HttpException('Not enough balance', HttpStatus.OK)
            }

            const transferId = await this.transfersRepo.create({
                ...transfer,
                status: 'initial',
                from: userAddress,
                amount: +transfer.amount,
                type: 'transfer',
            })

            await user.$add('user_transfer', [transferId.id])

            return {
                transferId: transferId.id,
                comission,
                tx,
                //txId,
            }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async transferCust(user: User, userWallet: UserWallet, transfer: TransferDto) {
        const conn = await this.getConnection()

        const tx: TxPayload = {}
        let balance: string
        let transferAmount: string

        const userAccount = conn.w3.eth.accounts.decrypt(
            userWallet.keystore as EncryptedKeystoreV3Json,
            await this.configService.get('DEFAULT_PASSWORD'),
        )

        try {
            if (transfer.token != 'MATIC') {
                const token = await this.appConfigService.getOneTokenBySymbolByNetwork(transfer.token, conn.chainId)
                if (!token) throw new HttpException('Token not found', HttpStatus.OK)

                const erc20Contract = new conn.w3.eth.Contract(Erc20_json.abi as U.AbiItem[], token.contractAddress)
                balance = await erc20Contract.methods.balanceOf(userAccount.address).call()
                transferAmount = U.toWei(transfer.amount, token.decimals === 18 ? 'ether' : 'gwei')
                const data = erc20Contract.methods.transfer(transfer.to, transferAmount)

                tx.to = token.contractAddress
                tx.gas = await data.estimateGas({ from: userAccount.address, value: 0 })
                tx.data = data.encodeABI()
                tx.value = 0
            } else {
                balance = await conn.w3.eth.getBalance(userAccount.address)
                transferAmount = U.toWei(transfer.amount, 'ether')

                tx.to = transfer.to
                tx.gas = await conn.w3.eth.estimateGas({
                    from: userAccount.address,
                    to: transfer.to,
                    value: transferAmount,
                })
                tx.value = +transferAmount
            }

            tx.nonce = await conn.w3.eth.getTransactionCount(userAccount.address)
            tx.maxPriorityFeePerGas = +(await conn.w3.eth.getGasPrice())
            tx.from = userAccount.address
            tx.chainId = conn.chainId

            const comission = U.fromWei((tx.gas * tx.maxPriorityFeePerGas).toFixed(0), 'ether')

            if (+balance < +transferAmount + +comission) {
                throw new HttpException('Not enough balance', HttpStatus.OK)
            }

            const signed = await userAccount.signTransaction(tx)
            const txReceipt = await conn.w3.eth.sendSignedTransaction(signed.rawTransaction)

            const transferId = await this.transfersRepo.create({
                ...transfer,
                status: txReceipt.status ? 'success' : 'failed',
                from: userAccount.address,
                amount: +transfer.amount,
                type: 'transfer',
                tx: txReceipt,
            })

            await user.$add('user_transfer', [transferId.id])

            return {
                transferId: transferId.id,
                comission,
                txReceipt,
            }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async donationExt(user: User, userAddress: string, orgAddress: string, donation: DonationDto) {
        const conn = await this.getConnection()

        const tx: TxPayload = {}
        let balance: string
        let transferAmount: string

        try {
            if (donation.token != 'MATIC') {
                const token = await this.appConfigService.getOneTokenBySymbolByNetwork(donation.token, conn.chainId)
                if (!token) throw new HttpException('Token not found', HttpStatus.OK)

                const erc20Contract = new conn.w3.eth.Contract(Erc20_json.abi as U.AbiItem[], token.contractAddress)
                balance = await erc20Contract.methods.balanceOf(userAddress).call()
                transferAmount = U.toWei(donation.amount, token.decimals === 18 ? 'ether' : 'gwei')
                const orgContract = new conn.w3.eth.Contract(Organization_json.abi as U.AbiItem[], orgAddress)
                const data = orgContract.methods.donateTokens(token.symbol, transferAmount)

                tx.gas = await data.estimateGas({ from: userAddress, value: 0 })
                tx.data = data.encodeABI()
                tx.value = 0
            } else {
                balance = await conn.w3.eth.getBalance(userAddress)
                transferAmount = U.toWei(donation.amount, 'ether')

                tx.gas = await conn.w3.eth.estimateGas({
                    from: userAddress,
                    to: orgAddress,
                    value: transferAmount,
                })
                tx.value = +transferAmount
            }

            tx.nonce = await conn.w3.eth.getTransactionCount(userAddress)
            tx.maxPriorityFeePerGas = +(await conn.w3.eth.getGasPrice())
            tx.from = userAddress
            tx.to = orgAddress
            tx.chainId = conn.chainId

            const comission = U.fromWei((tx.gas * tx.maxPriorityFeePerGas).toFixed(0), 'ether')

            if (+balance < +transferAmount + +comission) {
                throw new HttpException('Not enough balance', HttpStatus.OK)
            }

            const transferId = await this.transfersRepo.create({
                ...donation,
                status: 'initial',
                from: userAddress,
                amount: +donation.amount,
                type: 'donation',
            })
            await user.$add('user_transfer', [transferId.id])

            return {
                transferId: transferId.id,
                comission,
                tx,
                //txId,
            }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async donationCust(user: User, userWallet: UserWallet, orgAddress: string, donation: DonationDto) {
        const conn = await this.getConnection()

        let tx: TxPayload = {}
        let balance: string
        let transferAmount: string

        const userAccount = conn.w3.eth.accounts.decrypt(
            userWallet.keystore as EncryptedKeystoreV3Json,
            await this.configService.get('DEFAULT_PASSWORD'),
        )

        let nonce = await conn.w3.eth.getTransactionCount(userAccount.address)
        const gasPrice = +(await conn.w3.eth.getGasPrice())

        try {
            if (donation.token != 'MATIC') {
                const token = await this.appConfigService.getOneTokenBySymbolByNetwork(donation.token, conn.chainId)
                if (!token) throw new HttpException('Token not found', HttpStatus.OK)

                const erc20Contract = new conn.w3.eth.Contract(Erc20_json.abi as U.AbiItem[], token.contractAddress)
                balance = await erc20Contract.methods.balanceOf(userAccount.address).call()
                transferAmount = U.toWei(donation.amount, token.decimals === 18 ? 'ether' : 'gwei')
                const orgContract = new conn.w3.eth.Contract(Organization_json.abi as U.AbiItem[], orgAddress)
                const allowance = await erc20Contract.methods.allowance(userAccount.address, orgAddress).call()

                if (+allowance < +transferAmount) {
                    const data = erc20Contract.methods.approve(
                        orgAddress,
                        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                    )
                    tx = {
                        nonce,
                        value: 0,
                        chainId: conn.chainId,
                        from: userAccount.address,
                        to: token.contractAddress,
                        gas: await data.estimateGas({ from: userAccount.address, value: 0 }),
                        maxPriorityFeePerGas: gasPrice,
                        data: data.encodeABI(),
                    }

                    const signed = await userAccount.signTransaction(tx)
                    await conn.w3.eth.sendSignedTransaction(signed.rawTransaction)

                    nonce++
                }

                const data = orgContract.methods.donateTokens(token.symbol, transferAmount)

                tx.gas = await data.estimateGas({ from: userAccount.address, value: 0 })
                tx.data = data.encodeABI()
                tx.value = 0
            } else {
                balance = await conn.w3.eth.getBalance(userAccount.address)
                transferAmount = U.toWei(donation.amount, 'ether')

                tx.gas = await conn.w3.eth.estimateGas({
                    from: userAccount.address,
                    to: orgAddress,
                    value: transferAmount,
                })
                tx.value = +transferAmount
            }

            tx.nonce = nonce
            tx.maxPriorityFeePerGas = gasPrice
            tx.from = userAccount.address
            tx.to = orgAddress
            tx.chainId = conn.chainId

            const comission = U.fromWei((tx.gas * tx.maxPriorityFeePerGas).toFixed(0), 'ether')

            if (+balance < +transferAmount + +comission) {
                throw new HttpException('Not enough balance', HttpStatus.OK)
            }

            const signed = await userAccount.signTransaction(tx)
            const txReceipt = await conn.w3.eth.sendSignedTransaction(signed.rawTransaction)

            const transferId = await this.transfersRepo.create({
                ...donation,
                status: txReceipt.status ? 'success' : 'failed',
                from: userAccount.address,
                amount: +donation.amount,
                type: 'donation',
                tx: txReceipt,
            })
            await user.$add('user_transfer', [transferId.id])

            return {
                transferId: transferId.id,
                comission,
                txReceipt,
            }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async donationToAllExt(user: User, userAddress: string, donation: DonationDto) {
        const conn = await this.getConnection()
        const configData = await this.appConfigService.getConfiguration()

        const tx: TxPayload = {}
        let balance: string
        let transferAmount: string

        try {
            if (donation.token != 'MATIC') {
                const token = await this.appConfigService.getOneTokenBySymbolByNetwork(donation.token, conn.chainId)
                if (!token) throw new HttpException('Token not found', HttpStatus.OK)

                const erc20Contract = new conn.w3.eth.Contract(Erc20_json.abi as U.AbiItem[], token.contractAddress)
                balance = await erc20Contract.methods.balanceOf(userAddress).call()
                transferAmount = U.toWei(donation.amount, token.decimals === 18 ? 'ether' : 'gwei')
                const factoryContract = new conn.w3.eth.Contract(Factory_json.abi as U.AbiItem[], configData.factory)
                const data = factoryContract.methods.donateTokens(token.symbol, transferAmount)

                tx.gas = await data.estimateGas({ from: userAddress, value: 0 })
                tx.data = data.encodeABI()
                tx.value = 0
            } else {
                balance = await conn.w3.eth.getBalance(userAddress)
                transferAmount = U.toWei(donation.amount, 'ether')

                tx.gas = await conn.w3.eth.estimateGas({
                    from: userAddress,
                    to: configData.factory,
                    value: transferAmount,
                })
                tx.value = +transferAmount
            }

            tx.nonce = await conn.w3.eth.getTransactionCount(userAddress)
            tx.maxPriorityFeePerGas = +(await conn.w3.eth.getGasPrice())
            tx.from = userAddress
            tx.to = configData.factory
            tx.chainId = conn.chainId

            const comission = U.fromWei((tx.gas * tx.maxPriorityFeePerGas).toFixed(0), 'ether')

            if (+balance < +transferAmount + +comission) {
                throw new HttpException('Not enough balance', HttpStatus.OK)
            }

            const transferId = await this.transfersRepo.create({
                ...donation,
                status: 'initial',
                from: userAddress,
                amount: +donation.amount,
                type: 'donation',
            })
            await user.$add('user_transfer', [transferId.id])

            return {
                transferId: transferId.id,
                comission,
                tx,
                //txId,
            }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async donationToAllCust(user: User, userWallet: UserWallet, donation: DonationDto) {
        const conn = await this.getConnection()
        const configData = await this.appConfigService.getConfiguration()

        let tx: TxPayload = {}
        let balance: string
        let transferAmount: string

        const userAccount = conn.w3.eth.accounts.decrypt(
            userWallet.keystore as EncryptedKeystoreV3Json,
            await this.configService.get('DEFAULT_PASSWORD'),
        )

        let nonce = await conn.w3.eth.getTransactionCount(userAccount.address)
        const gasPrice = +(await conn.w3.eth.getGasPrice())

        try {
            if (donation.token != 'MATIC') {
                const token = await this.appConfigService.getOneTokenBySymbolByNetwork(donation.token, conn.chainId)
                if (!token) throw new HttpException('Token not found', HttpStatus.OK)

                const erc20Contract = new conn.w3.eth.Contract(Erc20_json.abi as U.AbiItem[], token.contractAddress)
                balance = await erc20Contract.methods.balanceOf(userAccount.address).call()
                transferAmount = U.toWei(donation.amount, token.decimals === 18 ? 'ether' : 'gwei')
                const factoryContract = new conn.w3.eth.Contract(Factory_json.abi as U.AbiItem[], configData.factory)
                const allowance = await erc20Contract.methods.allowance(userAccount.address, configData.factory).call()

                if (+allowance < +transferAmount) {
                    const data = erc20Contract.methods.approve(
                        configData.factory,
                        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                    )
                    tx = {
                        nonce,
                        value: 0,
                        chainId: conn.chainId,
                        from: userAccount.address,
                        to: token.contractAddress,
                        gas: await data.estimateGas({ from: userAccount.address, value: 0 }),
                        maxPriorityFeePerGas: gasPrice,
                        data: data.encodeABI(),
                    }

                    const signed = await userAccount.signTransaction(tx)
                    await conn.w3.eth.sendSignedTransaction(signed.rawTransaction)

                    nonce++
                }

                const data = factoryContract.methods.donateTokens(token.symbol, transferAmount)

                tx.gas = await data.estimateGas({ from: userAccount.address, value: 0 })
                tx.data = data.encodeABI()
                tx.value = 0
            } else {
                balance = await conn.w3.eth.getBalance(userAccount.address)
                transferAmount = U.toWei(donation.amount, 'ether')

                tx.gas = await conn.w3.eth.estimateGas({
                    from: userAccount.address,
                    to: configData.factory,
                    value: transferAmount,
                })
                tx.value = +transferAmount
            }

            tx.nonce = nonce
            tx.maxPriorityFeePerGas = gasPrice
            tx.from = userAccount.address
            tx.to = configData.factory
            tx.chainId = conn.chainId

            const comission = U.fromWei((tx.gas * tx.maxPriorityFeePerGas).toFixed(0), 'ether')

            if (+balance < +transferAmount + +comission) {
                throw new HttpException('Not enough balance', HttpStatus.OK)
            }

            const signed = await userAccount.signTransaction(tx)
            const txReceipt = await conn.w3.eth.sendSignedTransaction(signed.rawTransaction)

            const transferId = await this.transfersRepo.create({
                ...donation,
                status: txReceipt.status ? 'success' : 'failed',
                from: userAccount.address,
                amount: +donation.amount,
                type: 'donation',
                tx: txReceipt,
            })
            await user.$add('user_transfer', [transferId.id])

            return {
                transferId: transferId.id,
                comission,
                txReceipt,
            }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getOneUserTransfer(user: User, param: GetTransferDto) {
        return await this.transfersRepo.findOne({
            where: { userId: user.id, from: param.address, id: param.txId },
            attributes: {
                exclude: ['userId', 'updatedAt'],
            },
        })
    }

    async getAllUserTransfersWithFilter(user: User, from: string, filter: TransferFilterDto) {
        const type = filter.type
        const paginate = {
            page: !filter.page ? null : filter.page,
            limit: !filter.limit ? null : filter.limit,
        }

        let transactions: { rows: Transfer[]; count: number }

        delete filter.page
        delete filter.limit
        delete filter.type

        if (type === 'all') {
            transactions = await this.transfersRepo.findAndCountAll({
                where: {
                    userId: user.id,
                    from,
                    ...filter,
                },
                attributes: {
                    exclude: ['userId', 'updatedAt'],
                },
                offset:
                    !paginate || !paginate.limit || !paginate.page ? null : 0 + (+paginate.page - 1) * +paginate.limit,
                limit: !paginate || !paginate.limit ? null : paginate.limit,
                order: [['createdAt', 'DESC']],
            })
        } else {
            transactions = await this.transfersRepo.findAndCountAll({
                where: {
                    userId: user.id,
                    type,
                    from,
                    ...filter,
                },
                attributes: {
                    exclude: ['userId', 'updatedAt'],
                },
                offset:
                    !paginate || !paginate.limit || !paginate.page ? null : 0 + (+paginate.page - 1) * +paginate.limit,
                limit: !paginate || !paginate.limit ? null : paginate.limit,
                order: [['createdAt', 'DESC']],
            })
        }

        const donated_matic = await this.transfersRepo.findAll<any>({
            where: {
                userId: user.id,
                type: 'donation',
                token: 'MATIC',
                from,
            },
            attributes: [[fn('SUM', cast(col('amount'), 'float')), 'total']],
            raw: true,
        })

        const donated_chat = await this.transfersRepo.findAll<any>({
            where: {
                userId: user.id,
                type: 'donation',
                token: 'CHAT',
                from,
            },
            attributes: [[fn('SUM', cast(col('amount'), 'float')), 'total']],
            raw: true,
        })

        const matic_usd_price = (await this.appConfigService.getOneTokenBySymbolByNetwork('WMATIC', 137))
            .latest_usdc_price
        const chat_matic_price = (await this.appConfigService.getOneTokenBySymbolByNetwork('CHAT', 137))
            .latest_matic_price
        const chat_usd_price = chat_matic_price * matic_usd_price

        const total_donated_usd = donated_matic[0].total * matic_usd_price + donated_chat[0].total * chat_usd_price

        return {
            total_donated_usd,
            total_donated_matic: donated_matic[0].total,
            total_donated_chat: donated_chat[0].total,
            transactions,
        }
    }

    async updateStatus(user: User, param: TxSatatusIdDto, txHash: string, tx = null) {
        try {
            if (param.txType === 'swap') {
                tx = await this.swapRepo.findOne({ where: { id: param.txId, userId: user.id } })
            } else if (param.txType === 'transfer' || param.txType === 'donate') {
                tx = await this.transfersRepo.findOne({ where: { id: param.txId, userId: user.id } })
            }

            if (!tx) throw new HttpException('transaction not found', HttpStatus.OK)

            tx.status = 'pending'
            tx.txId = txHash
            await tx.save()

            return 'OK'
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    //#endregion

    //#region Contacts

    async deleteContact(user: User, address: string) {
        try {
            const userContact = await user.$get('user_contacts', { where: { address } })

            const result = await this.userWalletRepo.destroy({
                where: { id: userContact[0].id },
            })

            return result
        } catch (error) {
            throw new HttpException('Contact not found', HttpStatus.OK)
        }
    }

    async updateContact(user: User, address: string, name: string) {
        try {
            const contactObj = await user.$get('user_contacts', {
                where: { address },
            })

            const result = await this.contactsRepo.update({ name }, { where: { id: contactObj[0].id } })

            return result
        } catch (error) {
            throw new HttpException('Contact not found', HttpStatus.OK)
        }
    }

    async getAllContacts(user: User, paginate?: PaginateDto) {
        try {
            const count = await user.$count('user_contacts')

            const rows = await user.$get('user_contacts', {
                attributes: { exclude: ['id', 'updatedAt', 'userId', 'createdAt'] },
                offset:
                    !paginate || !paginate.limit || !paginate.page ? null : 0 + (+paginate.page - 1) * +paginate.limit,
                limit: !paginate || !paginate.limit ? null : paginate.limit,
                order: [['createdAt', 'DESC']],
            })

            return {
                count,
                rows,
            }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async addNewContact(user: User, contact: ContactDto) {
        try {
            await user.$create('user_contact', contact)
            await user.save()

            return 'Contact added'
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    //#endregion

    //#region Swap

    async swapCust(user: User, wallet: UserWallet, swap: SwapTokensDto) {
        try {
            const conn = await this.getConnection()

            const token0 = await this.appConfigService.getOneTokenBySymbolByNetwork(swap.token0, conn.chainId)
            const token1 = await this.appConfigService.getOneTokenBySymbolByNetwork(swap.token1, conn.chainId)

            if (swap.token0 != 'WMATIC' && !token0) {
                throw new HttpException('token0 not found', HttpStatus.OK)
            }

            if (swap.token1 != 'WMATIC' && !token1) {
                throw new HttpException('token1 not found', HttpStatus.OK)
            }

            const configData = await this.appConfigService.getConfiguration()
            const router = new conn.w3.eth.Contract(SwapRouter_json.abi as U.AbiItem[], configData.router)
            const maticAddress = await router.methods.WETH().call()

            const tradeCase =
                swap.token0 === 'WMATIC' ? 'EthToErc20' : swap.token1 === 'WMATIC' ? 'Erc20ToEth' : 'Erc20ToErc20'

            const route =
                swap.token0 !== 'WMATIC' && swap.token1 !== 'WMATIC'
                    ? [token0.contractAddress, maticAddress, token1.contractAddress]
                    : [token0.contractAddress, token1.contractAddress]

            const tradeAmountIn = U.toWei(swap.amount.toString(), 'ether')
            const amounts = await router.methods.getAmountsOut(tradeAmountIn, route).call()
            const amountOut = +amounts[amounts.length - 1]
            const minAmountOut = swap.slippage === -1 ? 0 : (amountOut - amountOut * (swap.slippage / 100)).toFixed(0)
            const deadline = Math.round(Date.now() / 1000) + 60 * swap.deadline

            let data = null
            let type = ''
            const txData: TxPayload = {}

            const allowance = await this.getAllowanceAndBalance(
                tradeAmountIn,
                token0.contractAddress,
                wallet.address,
                configData.router,
                conn,
            )

            switch (tradeCase) {
                case 'EthToErc20':
                    if (!allowance.enoughEth) {
                        throw new HttpException('Not enough balance', HttpStatus.OK)
                    }

                    data = router.methods.swapExactETHForTokensSupportingFeeOnTransferTokens(
                        minAmountOut,
                        route,
                        wallet.address,
                        deadline,
                    )

                    txData.value = +tradeAmountIn
                    txData.to = configData.router
                    type = 'swap'

                    break

                case 'Erc20ToEth':
                    if (!allowance.enoughErc20) {
                        throw new HttpException('Not enough balance', HttpStatus.OK)
                    }

                    if (!allowance.enoughAllowance) {
                        data = await this.generateApproveData(token0.contractAddress, configData.router, conn)
                        txData.value = 0
                        txData.to = token0.contractAddress
                        type = 'approve'
                    } else {
                        data = router.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(
                            tradeAmountIn,
                            minAmountOut,
                            route,
                            wallet.address,
                            deadline,
                        )

                        txData.value = 0
                        txData.to = configData.router
                        type = 'swap'
                    }

                    break

                case 'Erc20ToErc20':
                    if (!allowance.enoughErc20) {
                        throw new HttpException('Not enough balance', HttpStatus.OK)
                    }

                    if (!allowance.enoughAllowance) {
                        data = await this.generateApproveData(token0.contractAddress, configData.router, conn)
                        txData.value = 0
                        txData.to = token0.contractAddress
                        type = 'approve'
                    } else {
                        txData.data = router.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                            tradeAmountIn,
                            minAmountOut,
                            route,
                            wallet.address,
                            deadline,
                        )

                        txData.value = 0
                        txData.to = configData.router
                        type = 'swap'
                    }

                    break
            }

            txData.nonce = await conn.w3.eth.getTransactionCount(wallet.address)
            txData.maxPriorityFeePerGas = +(await conn.w3.eth.getGasPrice())
            txData.gas = await data.estimateGas({ from: wallet.address })
            txData.data = data.encodeABI()
            txData.from = wallet.address

            const comission = U.fromWei((+txData.gas * +txData.maxPriorityFeePerGas).toFixed(0), 'ether')

            if (allowance.balanceEth < txData.value + +txData.gas * +txData.maxPriorityFeePerGas) {
                throw new HttpException('Not enought balance: value + comission', HttpStatus.OK)
            }

            const account = conn.w3.eth.accounts.decrypt(
                wallet.keystore as EncryptedKeystoreV3Json,
                await this.configService.get('DEFAULT_PASSWORD'),
            )

            const signed = await account.signTransaction(txData)
            const tx = await conn.w3.eth.sendSignedTransaction(signed.rawTransaction)

            if (type === 'swap') {
                const swapId = (
                    await user.$create('user_swap', {
                        status: tx.status ? 'success' : 'failed',
                        token0: swap.token0,
                        token1: swap.token1,
                        amount: +swap.amount,
                        address: wallet.address,
                        txData,
                        tx,
                    })
                ).id

                return {
                    type,
                    swapId,
                    route,
                    comission,
                    txData,
                    tx,
                }
            }

            return {
                type,
                txData,
                tx,
            }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async swapExt(user: User, address: string, swap: SwapTokensDto) {
        try {
            const conn = await this.getConnection()

            const token0 = await this.appConfigService.getOneTokenBySymbolByNetwork(swap.token0, conn.chainId)
            const token1 = await this.appConfigService.getOneTokenBySymbolByNetwork(swap.token1, conn.chainId)

            if (swap.token0 != 'WMATIC' && !token0) {
                throw new HttpException('token0 not found', HttpStatus.OK)
            }

            if (swap.token1 != 'WMATIC' && !token1) {
                throw new HttpException('token1 not found', HttpStatus.OK)
            }

            const configData = await this.appConfigService.getConfiguration()
            const router = new conn.w3.eth.Contract(SwapRouter_json.abi as U.AbiItem[], configData.router)
            const maticAddress = await router.methods.WETH().call()

            const tradeCase =
                swap.token0 === 'WMATIC' ? 'EthToErc20' : swap.token1 === 'WMATIC' ? 'Erc20ToEth' : 'Erc20ToErc20'

            const route =
                swap.token0 !== 'WMATIC' && swap.token1 !== 'WMATIC'
                    ? [token0.contractAddress, maticAddress, token1.contractAddress]
                    : [token0.contractAddress, token1.contractAddress]

            const tradeAmountIn = U.toWei(swap.amount.toString(), 'ether')
            const amounts = await router.methods.getAmountsOut(tradeAmountIn, route).call()
            const amountOut = +amounts[amounts.length - 1]
            const minAmountOut = swap.slippage === -1 ? 0 : (amountOut - amountOut * (swap.slippage / 100)).toFixed(0)
            const deadline = Math.round(Date.now() / 1000) + 60 * swap.deadline

            let data = null
            let type = ''
            const txData: TxPayload = {}

            const allowance = await this.getAllowanceAndBalance(
                tradeAmountIn,
                token0.contractAddress,
                address,
                configData.router,
                conn,
            )

            switch (tradeCase) {
                case 'EthToErc20':
                    if (!allowance.enoughEth) {
                        throw new HttpException('Not enough balance', HttpStatus.OK)
                    }

                    data = router.methods.swapExactETHForTokensSupportingFeeOnTransferTokens(
                        minAmountOut,
                        route,
                        address,
                        deadline,
                    )
                    txData.value = +tradeAmountIn
                    txData.to = configData.router
                    type = 'swap'

                    break

                case 'Erc20ToEth':
                    if (!allowance.enoughErc20) {
                        throw new HttpException('Not enough balance', HttpStatus.OK)
                    }

                    if (!allowance.enoughAllowance) {
                        data = await this.generateApproveData(token0.contractAddress, configData.router, conn)
                        txData.value = 0
                        txData.to = token0.contractAddress
                        type = 'approve'
                    } else {
                        data = router.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(
                            tradeAmountIn,
                            minAmountOut,
                            route,
                            address,
                            deadline,
                        )
                        txData.value = 0
                        txData.to = configData.router
                        type = 'swap'
                    }

                    break

                case 'Erc20ToErc20':
                    if (!allowance.enoughErc20) {
                        throw new HttpException('Not enough balance', HttpStatus.OK)
                    }

                    if (!allowance.enoughAllowance) {
                        data = await this.generateApproveData(token0.contractAddress, configData.router, conn)
                        txData.value = 0
                        txData.to = token0.contractAddress
                        type = 'approve'
                    } else {
                        txData.data = router.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                            tradeAmountIn,
                            minAmountOut,
                            route,
                            address,
                            deadline,
                        )
                        txData.value = 0
                        txData.to = configData.router
                        type = 'swap'
                    }

                    break
            }

            txData.nonce = await conn.w3.eth.getTransactionCount(address)
            txData.maxPriorityFeePerGas = +(await conn.w3.eth.getGasPrice())
            txData.gas = await data.estimateGas({ from: address, value: txData.value })
            txData.data = data.encodeABI()
            txData.from = address

            const comission = U.fromWei((+txData.gas * +txData.maxPriorityFeePerGas).toFixed(0), 'ether')

            if (allowance.balanceEth < txData.value + +txData.gas * +txData.maxPriorityFeePerGas) {
                throw new HttpException('Not enought balance: value + comission', HttpStatus.OK)
            }

            if (type === 'swap') {
                const swapId = (
                    await user.$create('user_swap', {
                        status: 'initial',
                        token0: swap.token0,
                        token1: swap.token1,
                        amount: +swap.amount,
                        address: address,
                        txData,
                    })
                ).id

                return {
                    type,
                    swapId,
                    route,
                    comission,
                    txData,
                }
            }

            return {
                type,
                txData,
            }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getAllowanceAndBalance(
        amount: string,
        from: string,
        address: string,
        router: string,
        conn: { mode?: string; host?: any; chainId?: number; w3: any },
    ) {
        const contract = new conn.w3.eth.Contract(Erc20_json.abi as U.AbiItem[], from)
        const allowance = await contract.methods.allowance(address, router).call()
        const balanceEth = await conn.w3.eth.getBalance(address)
        const balanceErc20 = await contract.methods.balanceOf(address).call()

        return {
            enoughAllowance: !U.toBN(amount).gte(U.toBN(allowance)),
            enoughEth: !U.toBN(amount).gte(U.toBN(balanceEth)),
            enoughErc20: !U.toBN(amount).gte(U.toBN(balanceErc20)),
            balanceErc20,
            balanceEth,
        }
    }

    async generateApproveData(
        from: any,
        router: any,
        conn: { w3: { eth: { Contract: new (arg0: U.AbiItem[], arg1: any) => any } } },
    ) {
        const contract = new conn.w3.eth.Contract(Erc20_json.abi as U.AbiItem[], from)
        return contract.methods.approve(router, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
    }

    async getAllUserSwapsWithFilter(user: User, address: string, filter: SwapsFilterDto) {
        const paginate = {
            page: !filter.page ? null : filter.page,
            limit: !filter.limit ? null : filter.limit,
        }

        delete filter.page
        delete filter.limit

        return await this.swapRepo.findAndCountAll({
            where: { userId: user.id, address, ...filter },
            attributes: { exclude: ['userId', 'updatedAt'] },
            offset: !paginate || !paginate.limit || !paginate.page ? null : 0 + (+paginate.page - 1) * +paginate.limit,
            limit: !paginate || !paginate.limit ? null : paginate.limit,
            order: [['createdAt', 'DESC']],
        })
    }

    async getOneUserSwap(user: User, param: SwapIdDto) {
        return await this.swapRepo.findOne({
            where: { userId: user.id, address: param.address, id: param.swapId },
            attributes: { exclude: ['userId', 'updatedAt'] },
        })
    }

    //#endregion

    //#region Helpers

    async getPrice(price: CurrentDto) {
        const token0 = await this.appConfigService.getOneTokenBySymbolByNetwork(price.token0, 137)
        const token1 = await this.appConfigService.getOneTokenBySymbolByNetwork(price.token1, 137)

        if (!token0 || !token1) {
            throw new HttpException('Token not found', HttpStatus.OK)
        }

        const opts = {
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': await this.configService.get('BITQUERY_API_KEY'),
            },
        }

        const query = `
        query{
            ethereum(network: matic) {
                dexTrades(
                    options: {limit: 1, desc: "block.timestamp.time"}
                    exchangeName: {is: "QuickSwap"}
                    baseCurrency: {is: "${token0.contractAddress}"}
                    quoteCurrency: {is: "${token1.contractAddress}"}
                ) {
                    block {
                        timestamp {
                            time(format: "%Y-%m-%d %H:%M:%S")
                        }
                    }
                    quotePrice
                }
            }
        }
    `

        const data = JSON.stringify({ query })
        const url = this.configService.get('BITQUERY_API_URL')

        const result = (await axios.post(url, data, opts)).data

        if (result.data.ethereum.dexTrades && result.data.ethereum.dexTrades.length != 0) {
            return result.data.ethereum.dexTrades[0].quotePrice
        }

        return 0
    }

    async getConnection() {
        const mode = (await this.appConfigService.getConfigurationItem('mode')).mode
        const w3: Web3 = mode === 'mainnet' ? this.mn : this.tn
        const chainId = await w3.eth.net.getId()
        const host =
            mode === 'mainnet' ? this.configService.get('POLYGON_MAINNET') : this.configService.get('POLYGON_TESTNET')

        return { mode, host, chainId, w3 }
    }

    async getConnectionData() {
        const mode = (await this.appConfigService.getConfigurationItem('mode')).mode
        const w3: Web3 = mode === 'mainnet' ? this.mn : this.tn
        const chainId = await w3.eth.net.getId()
        const host =
            mode === 'mainnet' ? this.configService.get('POLYGON_MAINNET') : this.configService.get('POLYGON_TESTNET')

        return { mode, host, chainId }
    }

    @Cron(CronExpression.EVERY_HOUR)
    async handleRewardsCron() {
        const mode = (await this.appConfigService.getConfigurationItem('mode')).mode
        return await this.cronQueue.add('reflections', { mode })
    }

    @Cron(CronExpression.EVERY_HOUR)
    async handlePriceCron() {
        return await this.cronQueue.add('price')
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleTxCron() {
        const mode = (await this.appConfigService.getConfigurationItem('mode')).mode
        return await this.cronQueue.add('tx', { mode })
    }

    //#endregion
}
