import { SequelizeModule } from '@nestjs/sequelize'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { RolesModule } from './roles/roles.module'
import { UsersModule } from './users/users.module'
import { User } from './users/models/users.model'
import { Role } from './roles/models/roles.model'
import { UserRoles } from './roles/models/user-roles.model'
import { UserData } from './users/models/user-data.model'
import { UserTokens } from './users/models/user-tokens.model'
import { AuthModule } from './auth/auth.module'
import { UserWallet } from './wallet/models/user-wallet.model'
import { Contact } from './wallet/models/contacts.model'
import { ExtToken } from './app-config/models/ext-tokens.model'
import { AppConfig } from './app-config/models/app-config.model'
import { UserConfig } from './app-config/models/user-config.model'
import { AppConfigModule } from './app-config/app-config.module'
import { WalletModule } from './wallet/wallet.module'
import { BullModule } from '@nestjs/bull'
import { ScheduleModule } from '@nestjs/schedule'
import { Transfer } from './wallet/models/transfer.model'
import { PresaleModule } from './presale/presale.module'
import { NotificationsModule } from './common/notifications/notifications.module'
import { Reward } from './wallet/models/rewards.model'
import { PaymentsModule } from './payments/payments.module'
import { Swap } from './wallet/models/swaps.model'
import { Payment } from './payments/models/payment.model'
import { Notification } from './common/notifications/model/notification.model'

@Module({
    imports: [
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                redis: {
                    host: configService.get('REDIS_HOST'),
                    port: configService.get('REDIS_PORT'),
                },
            }),
            inject: [ConfigService],
        }),
        ScheduleModule.forRoot(),
        ConfigModule.forRoot({
            envFilePath: `.${process.env.NODE_ENV}.env`,
        }),
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: process.env.POSTGRES_HOST,
            port: +process.env.POSTGRES_PORT,
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            models: [
                User,
                Role,
                UserRoles,
                UserData,
                UserTokens,
                UserWallet,
                Contact,
                ExtToken,
                AppConfig,
                UserConfig,
                Transfer,
                Reward,
                Swap,
                Payment,
                Notification,
            ],
            autoLoadModels: true,
            synchronize: true,
            logging: false,
        }),
        AuthModule,
        RolesModule,
        UsersModule,
        AppConfigModule,
        WalletModule,
        NotificationsModule,
        PresaleModule,
        PaymentsModule,
    ],
})
export class AppModule {}
