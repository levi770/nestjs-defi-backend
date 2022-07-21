import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { AppConfigController } from './app-config.controller'
import { AppConfigService } from './app-config.service'
import { UserConfig } from './models/user-config.model'
import { ConfigModule } from '@nestjs/config'
import { ExtToken } from './models/ext-tokens.model'
import { AppConfig } from './models/app-config.model'

@Module({
    controllers: [AppConfigController],
    providers: [AppConfigService],
    imports: [SequelizeModule.forFeature([ExtToken, AppConfig, UserConfig]), ConfigModule],
    exports: [AppConfigService],
})
export class AppConfigModule {}
