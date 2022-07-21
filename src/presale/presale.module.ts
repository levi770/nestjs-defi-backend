import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppConfigModule } from 'src/app-config/app-config.module'
import { UsersModule } from 'src/users/users.module'
import { WalletModule } from 'src/wallet/wallet.module'
import { PresaleController } from './presale.controller'
import { PresaleService } from './presale.service'

@Module({
    controllers: [PresaleController],
    providers: [PresaleService],
    imports: [UsersModule, ConfigModule, AppConfigModule, WalletModule],
})
export class PresaleModule {}
