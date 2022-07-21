import axios from 'axios'
import * as crypto from 'crypto'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Op } from 'sequelize'
import { RateDto } from './dto/rate.dto'
import { TransactionDto } from './dto/transaction.dto'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/sequelize'
import { Payment } from './models/payment.model'
import { PaymentsFilterDto } from './dto/payments-filter.dto'
import { CallbackDto } from './dto/callback.dto'
import { User } from 'src/users/models/users.model'
import { WalletService } from 'src/wallet/wallet.service'
import { UserWallet } from 'src/wallet/models/user-wallet.model'

@Injectable()
export class PaymentsService {
    constructor(
        @InjectModel(Payment) private paymentsRepository: typeof Payment,
        private walletService: WalletService,
        private configService: ConfigService,
    ) {}

    async callback(callback: CallbackDto) {
        if (!callback.transactionId) return

        const transaction = await this.paymentsRepository.findOne({
            where: { transactionId: callback.transactionId },
        })

        if (!transaction) return

        return await this.paymentsRepository.update(
            {
                status: callback.status,
                blockchainHash: callback.blockchainHash,
                reason: callback.reason,
                extra_info: callback.extra_info,
                couponCode: callback.couponCode,
                confirmedAt: new Date(callback.confirmedAt),
                finishedAt: new Date(callback.finishedAt),
                amountOut: callback.amountOut,
                realAmountOut: callback.realAmountOut,
            },
            { where: { id: transaction.id } },
        )
    }

    async getCurrencies() {
        try {
            const target_url = 'https://indacoin.com/api/mobgetcurrencies/1'
            const result = await axios.get(target_url)
            return result.data
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getCurrencyRate(rate: RateDto) {
        try {
            const target_url = 'https://indacoin.com/api/GetCoinConvertAmount'
            const url = `${target_url}/${rate.currencyFrom}/${rate.currencyTo}/${rate.amount}`
            const result = await axios.get(url)
            return result.data
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async newTransaction(user: User, transaction: TransactionDto) {
        const userAddress = await user.$get('user_wallets', {
            where: { address: transaction.target_address },
        })

        if (!userAddress[0]) {
            throw new HttpException('Address not found', HttpStatus.OK)
        }

        const target_url = 'https://indacoin.com/api/exgw_createTransaction'
        const nonce = '1000000'
        const partnername = this.configService.get('INDACOIN_PARTNER_NAME')
        const string = partnername + '_' + nonce
        const secret = this.configService.get('INDACOIN_SECRET')
        const sig = crypto.createHmac('sha256', secret).update(string).digest('base64')

        const data = {
            user_id: user.id,
            cur_in: transaction.cur_in,
            cur_out: transaction.cur_out,
            target_address: transaction.target_address,
            amount_in: transaction.amount_in,
        }

        const headers = {
            'Content-Type': 'application/json',
            'gw-partner': partnername,
            'gw-nonce': nonce,
            'gw-sign': sig,
        }

        try {
            const transaction_id = await axios.post(target_url, data, {
                headers: headers,
            })

            if (
                transaction_id.data ===
                    'creation of transaction for this currency is temporarily disabled or amount is too small' ||
                typeof transaction_id.data != 'number'
            ) {
                throw new HttpException(transaction_id.data, HttpStatus.INTERNAL_SERVER_ERROR)
            }

            const payment = await this.paymentsRepository.create({
                transactionId: transaction_id.data,
                status: 'initial',
                curIn: transaction.cur_in,
                curOut: transaction.cur_out,
                amountIn: transaction.amount_in,
            })

            await payment.$set('user_wallet', userAddress[0].id)
            await payment.save()

            await user.$add('user_payment', payment.id)
            await user.save()

            const transaction_id_string = partnername + '_' + transaction_id.data

            const transaction_sig = Buffer.from(
                crypto.createHmac('sha256', secret).update(transaction_id_string).digest('base64'),
            ).toString('base64')

            const redirect_url = 'https://indacoin.com/gw/payment_form'

            return `${redirect_url}?transaction_id=${transaction_id.data}&partner=${partnername}&cnfhash=${transaction_sig}`
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getAllUserPaymentsWithFilter(user: User, address: string, filter: PaymentsFilterDto) {
        const userAddress = await user.$get('user_wallets', {
            where: { address },
        })

        if (!userAddress[0]) {
            throw new HttpException('Address not found', HttpStatus.OK)
        }

        filter.targetAddress = String(userAddress[0].id)

        const paginate = {
            page: !filter.page ? null : filter.page,
            limit: !filter.limit ? null : filter.limit,
        }

        delete filter.page
        delete filter.limit

        try {
            return await this.paymentsRepository.findAndCountAll({
                where: {
                    userId: user.id,
                    ...filter,
                },
                attributes: {
                    exclude: [
                        'userId',
                        'updatedAt',
                        'blockchainHash',
                        'reason',
                        'extra_info',
                        'couponCode',
                        'targetAddress',
                    ],
                },
                include: [
                    {
                        model: UserWallet,
                        attributes: {
                            exclude: ['id', 'userId', 'createdAt', 'updatedAt'],
                        },
                    },
                ],
                offset:
                    !paginate || !paginate.limit || !paginate.page ? null : 0 + (+paginate.page - 1) * +paginate.limit,
                limit: !paginate || !paginate.limit ? null : paginate.limit,
                order: [['createdAt', 'DESC']],
            })
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.OK)
        }
    }

    async getOneUserPayment(user: User, address: string, id: string) {
        try {
            return await this.paymentsRepository.findOne({
                where: {
                    userId: user.id,
                    [Op.or]: [{ id }, { transactionId: id }],
                },
                attributes: {
                    exclude: [
                        'userId',
                        'updatedAt',
                        'blockchainHash',
                        'reason',
                        'extra_info',
                        'couponCode',
                        'targetAddress',
                    ],
                },
                include: [
                    {
                        model: UserWallet,
                        attributes: {
                            exclude: ['id', 'userId', 'createdAt', 'updatedAt'],
                        },
                    },
                ],
            })
        } catch (error) {
            throw new HttpException('Payment not found', HttpStatus.OK)
        }
    }

    async getOnePayment(id: string) {
        try {
            return await this.paymentsRepository.findOne({
                where: { [Op.or]: [{ id }, { transactionId: id }] },
                attributes: {
                    exclude: [
                        'userId',
                        'updatedAt',
                        'blockchainHash',
                        'reason',
                        'extra_info',
                        'couponCode',
                        'targetAddress',
                    ],
                },
                include: [
                    {
                        model: UserWallet,
                        attributes: {
                            exclude: ['id', 'userId', 'createdAt', 'updatedAt'],
                        },
                    },
                ],
            })
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.OK)
        }
    }

    async getAllPaymentsWithFilter(filter: PaymentsFilterDto) {
        let userAddress: any[] | UserWallet
        if (filter.targetAddress) {
            userAddress = await this.walletService.getWalletByString(filter.targetAddress)

            if (!userAddress) {
                throw new HttpException('Address not found', HttpStatus.OK)
            }

            filter.targetAddress = String(userAddress.id)
        }

        const paginate = {
            page: !filter.page ? null : filter.page,
            limit: !filter.limit ? null : filter.limit,
        }

        delete filter.page
        delete filter.limit

        try {
            return await this.paymentsRepository.findAll({
                where: { ...filter },
                attributes: {
                    exclude: [
                        'userId',
                        'updatedAt',
                        'blockchainHash',
                        'reason',
                        'extra_info',
                        'couponCode',
                        'targetAddress',
                    ],
                },
                include: [
                    {
                        model: UserWallet,
                        attributes: {
                            exclude: ['id', 'userId', 'createdAt', 'updatedAt'],
                        },
                    },
                ],
                offset:
                    !paginate || !paginate.limit || !paginate.page ? null : 0 + (+paginate.page - 1) * +paginate.limit,
                limit: !paginate || !paginate.limit ? null : paginate.limit,
                order: [['createdAt', 'DESC']],
            })
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.OK)
        }
    }
}
