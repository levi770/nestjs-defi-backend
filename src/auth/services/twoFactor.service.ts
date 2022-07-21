import { Injectable } from '@nestjs/common'
import { authenticator } from 'otplib'
import { toBuffer } from 'qrcode'
import { UsersService } from '../../users/users.service'
import { ConfigService } from '@nestjs/config'
import { User } from 'src/users/models/users.model'

@Injectable()
export class TwoFactorService {
    constructor(private usersService: UsersService, private configService: ConfigService) {}

    public async generateTwoFactorSecret(user: User) {
        const secret = authenticator.generateSecret()

        const otpauthUrl = authenticator.keyuri(
            user.email,
            this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'),
            secret,
        )

        await this.usersService.setTwoFactorSecret(secret, user.id)

        return {
            secret,
            otpauthUrl,
        }
    }

    public async isTwoFactorCodeValid(twoFactorCode: string, user: User) {
        try {
            return authenticator.verify({
                token: twoFactorCode,
                secret: await this.usersService.getTwoFactorTokenbyId(user.id),
            })
        } catch (error) {}
    }

    public async pipeQrCodeStream(otpauthUrl: string) {
        return await toBuffer(otpauthUrl)
    }
}
