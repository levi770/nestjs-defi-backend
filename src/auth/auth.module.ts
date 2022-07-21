import { Module } from '@nestjs/common'
import { AuthService } from './services/auth.service'
import { UsersModule } from '../users/users.module'
import { AuthController } from './controllers/auth.controller'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { TwoFactorController } from './controllers/twoFactor.controller'
import { TwoFactorService } from './services/twoFactor.service'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { RefreshStrategy } from './strategies/refresh.strategy'
import { TwoFactorStrategy } from './strategies/two-factor.strategy'
import { GoogleAuthController } from './controllers/googleAuth.controller'
import { RolesModule } from 'src/roles/roles.module'
import { GoogleAuthService } from './services/googleAuth.service'
import { WalletModule } from 'src/wallet/wallet.module'
import { EmailConfirmController } from './controllers/emailConfirm.controller'
import { EmailConfirmService } from './services/emailConfirm.service'
import { EmailModule } from 'src/common/email/email.module'

@Module({
    imports: [
        PassportModule,
        ConfigModule,
        JwtModule.register({}),
        UsersModule,
        RolesModule,
        WalletModule,
        EmailModule,
    ],
    providers: [
        AuthService,
        GoogleAuthService,
        LocalStrategy,
        JwtStrategy,
        RefreshStrategy,
        TwoFactorService,
        TwoFactorStrategy,
        EmailConfirmService,
    ],
    controllers: [AuthController, TwoFactorController, GoogleAuthController, EmailConfirmController],
    exports: [AuthService],
})
export class AuthModule {}
