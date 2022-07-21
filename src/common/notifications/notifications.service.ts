import * as admin from 'firebase-admin'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { User } from 'src/users/models/users.model'
import { InjectModel } from '@nestjs/sequelize'
import { Notification } from './model/notification.model'
import { NotificationsFilterDto } from './dto/notifications-filter.dto'

@Injectable()
export class NotificationsService {
    constructor(@InjectModel(Notification) private notificationsRepo: typeof Notification) {}

    async sendNotification(user: User, title: string, body: string) {
        try {
            const userConfig = user.user_config
            const userTokens = user.user_tokens

            if (!userConfig || !userConfig.push_notifications || !userTokens || !userTokens.firebase_secret) {
                return
            }

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

            const notification = await this.notificationsRepo.create({ type: 'push', message })
            await notification.$set('user', user)

            return await admin.messaging().sendToDevice(userTokens.firebase_secret, message, options)
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getAllUserNotificationsWithFilter(user: User, filter?: NotificationsFilterDto) {
        const paginate = {
            page: !filter.page ? null : filter.page,
            limit: !filter.limit ? null : filter.limit,
        }

        delete filter.page
        delete filter.limit

        return await this.notificationsRepo.findAndCountAll({
            where: { userId: user.id, ...filter },
            attributes: { exclude: ['userId', 'updatedAt'] },
            offset: !paginate || !paginate.limit || !paginate.page ? null : 0 + (+paginate.page - 1) * +paginate.limit,
            limit: !paginate || !paginate.limit ? null : paginate.limit,
            order: [['createdAt', 'DESC']],
        })
    }

    async getOneUserNotification(userId: string, id: string) {
        return await this.notificationsRepo.findOne({
            where: { userId, id },
            attributes: { exclude: ['userId', 'updatedAt'] },
        })
    }
}
