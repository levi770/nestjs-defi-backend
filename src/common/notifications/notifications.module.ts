import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { NotificationsService } from './notifications.service'
import { Notification } from './model/notification.model'

@Module({
    providers: [NotificationsService],
    imports: [SequelizeModule.forFeature([Notification])],
    exports: [NotificationsService],
})
export class NotificationsModule {}
