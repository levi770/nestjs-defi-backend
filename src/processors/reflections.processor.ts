import axios from 'axios'
import Web3 from 'web3'
import U from 'web3-utils'
import { Job, DoneCallback } from 'bull'
import Reward from './models/Reward'
import Token from './models/Token'
import User from './models/User'
import Wallet from './models/Wallet'
import CharityToken from '../common/contracts/build/CharityToken.json'
import { Contract } from 'web3-eth-contract'

const tn = new Web3(new Web3.providers.HttpProvider(process.env.POLYGON_TESTNET))
const mn = new Web3(new Web3.providers.HttpProvider(process.env.POLYGON_MAINNET))

User.hasMany(Wallet, { sourceKey: 'id', foreignKey: 'userId', as: 'user_wallets' })
Wallet.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' })
Reward.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' })
Reward.belongsTo(Wallet, { foreignKey: 'walletId', targetKey: 'id' })
Reward.belongsTo(Token, { foreignKey: 'tokenId', targetKey: 'id' })

async function getBalanceInOut(address: string, contractaddress: string, from: Date, mode: string) {
    const endpoint = mode === 'mainnet' ? process.env.POLYGONSCAN_MAINNET : process.env.POLYGONSCAN_TESTNET

    const apikey = process.env.POLYGONSCAN_APIKEY
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

async function getRewards(wallet: Wallet, tokenBalance: string, token: Token, contract: Contract, mode: string) {
    const balanceInOut = await getBalanceInOut(wallet.address, token.contractAddress, wallet.createdAt, mode)
    const balance = +U.fromWei(tokenBalance, 'ether')
    let txDelta = balance
    if ((balanceInOut.in && balanceInOut.in != 0) || (balanceInOut.out && balanceInOut.out != 0)) {
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

async function cronProcessor(job: Job, doneCallback: DoneCallback) {
    try {
        const w3: Web3 = job.data.mode === 'mainnet' ? mn : tn

        const users = await User.findAll({ include: [{ model: Wallet, as: 'user_wallets' }] })
        const tokens = await Token.findAll({ where: { rewards: true, chainId: await w3.eth.getChainId() } })

        let reward: Reward
        for (const user of users) {
            const userWallets = await Wallet.findAll({ where: { userId: user.id } })

            for (const wallet of userWallets) {
                for (const token of tokens) {
                    const contract = new w3.eth.Contract(CharityToken.abi as U.AbiItem[], token.contractAddress)
                    const balance = await contract.methods.balanceOf(wallet.address).call()

                    if (+balance > 0) {
                        const addressRewards = await getRewards(wallet, balance, token, contract, job.data.mode)
                        reward = await Reward.create({ jobId: job.id, ...addressRewards })
                        await reward.setUser(user)
                        await reward.setWallet(wallet)
                        await reward.setToken(token)
                        await reward.save()
                    }
                }
            }
        }

        doneCallback(null, reward)
    } catch (error) {
        console.log('cron processor error:' + error.message)
        doneCallback(error, null)
    }
}

export default cronProcessor
