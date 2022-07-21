import { Module, CacheModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'
import { AppConfigModule } from 'src/app-config/app-config.module'
import { UsersModule } from 'src/users/users.module'
import { OrganizationsModule } from 'src/organizations/organizations.module'
import { BullModule } from '@nestjs/bull'
import { join } from 'path'
import { NotificationsModule } from 'src/common/notifications/notifications.module'
import * as redisStore from 'cache-manager-redis-store'
import { Contact } from './models/contacts.model'
import { UserWallet } from './models/user-wallet.model'
import { Transfer } from './models/transfer.model'
import { Reward } from './models/rewards.model'
import { Swap } from './models/swaps.model'
import { WalletController } from './wallet.controller'
import { WalletService } from './wallet.service'

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'cron',
            processors: [
                {
                    name: 'reflections',
                    path: join(
                        __dirname,
                        `../processors/reflections.processor.${process.env.NAME === 'base' ? 'js' : 'ts'}`,
                    ),
                },
                {
                    name: 'price',
                    path: join(__dirname, `../processors/price.processor.${process.env.NAME === 'base' ? 'js' : 'ts'}`),
                },
                {
                    name: 'tx',
                    path: join(__dirname, `../processors/tx.processor.${process.env.NAME === 'base' ? 'js' : 'ts'}`),
                },
            ],
        }),
        CacheModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                store: redisStore,
                host: configService.get('REDIS_HOST'),
                port: configService.get('REDIS_PORT'),
                ttl: 300,
            }),
        }),
        SequelizeModule.forFeature([Contact, UserWallet, Transfer, Reward, Swap]),
        UsersModule,
        ConfigModule,
        AppConfigModule,
        OrganizationsModule,
        NotificationsModule,
    ],
    controllers: [WalletController],
    providers: [WalletService],
    exports: [WalletService],
})
export class WalletModule {}
//
