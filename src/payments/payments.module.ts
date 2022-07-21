import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'
import { UsersModule } from 'src/users/users.module'
import { WalletModule } from 'src/wallet/wallet.module'
import { PaymentsController } from './payments.controller'
import { PaymentsService } from './payments.service'
import { Payment } from './models/payment.model'

@Module({
    controllers: [PaymentsController],
    providers: [PaymentsService],
    imports: [SequelizeModule.forFeature([Payment]), UsersModule, WalletModule, ConfigModule],
    exports: [PaymentsService],
})
export class PaymentsModule {}
