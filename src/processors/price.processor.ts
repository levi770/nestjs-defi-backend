import axios from 'axios'
import { Job, DoneCallback } from 'bull'
import Token from './models/Token'

async function getPrice(token0: string, token1: string) {
    const opts = {
        headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': process.env.BITQUERY_API_KEY,
        },
    }

    const query = `
        query{
            ethereum(network: matic) {
                dexTrades(
                    options: {limit: 1, desc: "block.timestamp.time"}
                    exchangeName: {is: "QuickSwap"}
                    baseCurrency: {is: "${token0}"}
                    quoteCurrency: {is: "${token1}"}
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
    const url = process.env.BITQUERY_API_URL

    const result = (await axios.post(url, data, opts)).data

    if (result.data.ethereum.dexTrades && result.data.ethereum.dexTrades.length != 0) {
        return result.data.ethereum.dexTrades[0].quotePrice
    }

    return false
}

async function cronProcessor(job: Job, doneCallback: DoneCallback) {
    try {
        const tokens_mainnet = await Token.findAll({ where: { chainId: 137 } })
        const tokens_testnet = await Token.findAll({ where: { chainId: 80001 } })
        const usdc = tokens_mainnet.find((x) => x.symbol === 'USDC')
        const usdc_testnet = tokens_testnet.find((x) => x.symbol === 'USDC')
        const wmatic = tokens_mainnet.find((x) => x.symbol === 'WMATIC')
        const wmatic_testnet = tokens_testnet.find((x) => x.symbol === 'WMATIC')

        if (!usdc) {
            throw new Error('USDC not found in db')
        }

        if (!wmatic) {
            throw new Error('USDC not found in db')
        }

        const matic_usdc_price = await getPrice(wmatic.contractAddress, usdc.contractAddress)
        await Token.update({ latest_usdc_price: matic_usdc_price }, { where: { id: wmatic.id } })
        await Token.update({ latest_usdc_price: matic_usdc_price }, { where: { id: wmatic_testnet.id } })

        const usdc_matic_price = await getPrice(usdc.contractAddress, wmatic.contractAddress)
        await Token.update({ latest_matic_price: usdc_matic_price }, { where: { id: usdc.id } })
        await Token.update({ latest_matic_price: usdc_matic_price }, { where: { id: usdc_testnet.id } })

        for (const token of tokens_mainnet) {
            if (token.symbol === 'WMATIC' || token.symbol === 'USDC') {
                continue
            }

            const testnet_token = tokens_testnet.find((x) => x.symbol === token.symbol)

            let token_usdc_price = await getPrice(token.contractAddress, usdc.contractAddress)
            const token_matic_price = await getPrice(token.contractAddress, wmatic.contractAddress)

            if (!token_usdc_price && !token_matic_price) {
                continue
            }

            if (!token_usdc_price) {
                token_usdc_price = token_matic_price * matic_usdc_price
            }

            await Token.update(
                { latest_usdc_price: token_usdc_price, latest_matic_price: token_matic_price },
                { where: { id: token.id } },
            )

            await Token.update(
                { latest_usdc_price: token_usdc_price, latest_matic_price: token_matic_price },
                { where: { id: testnet_token.id } },
            )
        }

        doneCallback(null, true)
    } catch (error) {
        console.log('price processor error:' + error.message)
        doneCallback(error, null)
    }
}

export default cronProcessor
