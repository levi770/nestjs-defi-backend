import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import { UsersService } from 'src/users/users.service'
import { TokenPayload } from '../interfaces/tokenPayload.interface'

@Injectable()
export class TwoFactorStrategy extends PassportStrategy(Strategy, 'jwt-two-factor') {
    constructor(private readonly configService: ConfigService, private readonly userService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.Authentication
                },
            ]),

            secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
        })
    }

    async validate(payload: TokenPayload) {
        const user = await this.userService.getUserById(payload.userId)

        if (!user.isTwoFactorAuthenticationEnabled) {
            return user
        }

        if (payload.isSecondFactorAuthenticated) {
            return user
        }
    }
}