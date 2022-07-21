import { Job, DoneCallback } from 'bull'
import Web3 from 'web3'
import * as admin from 'firebase-admin'
import { ServiceAccount } from 'firebase-admin'
import Transfer from './models/Transfer'
import Swap from './models/Swap'
import UserToken from './models/UserToken'

const adminConfig: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
}

admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
})

const tn = new Web3(new Web3.providers.HttpProvider(process.env.POLYGON_TESTNET))
const mn = new Web3(new Web3.providers.HttpProvider(process.env.POLYGON_MAINNET))

async function sendNotification(token: string, title: string, body: string) {
    try {
        const options = {
            priority: 'high',
            timeToLive: 60 * 60 * 24,
        }

        const message = {
            notification: {
                title,
                body,
            },
        }

        return await admin.messaging().sendToDevice(token, message, options)
    } catch (error) {
        console.log(error.message)
    }
}

async function transfersProcessor(job: Job, doneCallback: DoneCallback) {
    try {
        const w3: Web3 = job.data.mode === 'mainnet' ? mn : tn

        const transfers = await Transfer.findAll({ where: { status: 'pending' } })
        const swaps = await Swap.findAll({ where: { status: 'pending' } })

        for (let i = 0; i < transfers.length; i++) {
            const txHash = transfers[i].txId
            const txReciept = await w3.eth.getTransactionReceipt(txHash)

            if (!txReciept) {
                continue
            } else if (txReciept.status) {
                transfers[i].status = 'success'
                await transfers[i].save()

                const userTokens = await UserToken.findOne({
                    where: { userId: transfers[i].userId },
                })

                const title = 'Transfer transaction'
                const body = `{"message": "transaction_send", "args": ["${transfers[i].from}", "${transfers[i].to}"]}`
                await sendNotification(userTokens.firebase_secret, title, body)

                continue
            } else if (!txReciept.status) {
                transfers[i].status = 'failed'
                await transfers[i].save()

                const userTokens = await UserToken.findOne({
                    where: { userId: transfers[i].userId },
                })

                const title = 'Transfer transaction'
                const body = `{"message": "transaction_fail", "args": ["${transfers[i].from}", "${transfers[i].to}"]}`
                await sendNotification(userTokens.firebase_secret, title, body)

                continue
            }
        }

        for (let i = 0; i < swaps.length; i++) {
            const txHash = swaps[i].txId
            if (!txHash) continue

            const txReciept = await w3.eth.getTransactionReceipt(txHash)

            if (!txReciept) {
                continue
            } else if (txReciept.status) {
                swaps[i].status = 'success'
                await swaps[i].save()

                const userTokens = await UserToken.findOne({
                    where: { userId: swaps[i].userId },
                })

                const title = 'Swap transaction'
                const body = `{"message": "swap_success", "args": ["${swaps[i].amount} ${swaps[i].token0}", "${swaps[i].token1}"]}`

                await sendNotification(userTokens.firebase_secret, title, body)

                continue
            } else if (!txReciept.status) {
                swaps[i].status = 'failed'
                await swaps[i].save()

                const userTokens = await UserToken.findOne({
                    where: { userId: swaps[i].userId },
                })

                const title = 'Swap transaction'
                const body = `{"message": "swap_failed", "args": ["${swaps[i].token0}", "${swaps[i].token1}"]}`

                await sendNotification(userTokens.firebase_secret, title, body)

                continue
            }
        }

        doneCallback(null, true)
    } catch (error) {
        console.log('transfersProcessor error:' + error.message)
        doneCallback(error, null)
    }
}

export default transfersProcessor
