/* eslint-disable @typescript-eslint/no-var-requires */
import * as bcrypt from 'bcryptjs'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { recovery } from './HTML/recovery'
import { verification } from './HTML/verification'
import { new_password } from './HTML/new_password'
import { EmailService } from 'src/common/email/email.service'
import { UsersService } from 'src/users/users.service'
import { TokenPayload } from '../interfaces/tokenPayload-email.interface'

@Injectable()
export class EmailConfirmService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private emailService: EmailService,
        private usersService: UsersService,
    ) {}

    public sendVerificationLink(email: string) {
        const payload: TokenPayload = { email }

        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
            expiresIn: `${this.configService.get('JWT_VERIFICATION_TOKEN_EXPIRATION_TIME')}s`,
        })

        const link = `${this.configService.get('EMAIL_CONFIRMATION_URL')}?token=${token}`
        const html = verification(this.configService.get('URL'), link)

        return this.emailService.sendMail({
            to: email,
            from: {
                name: 'CharityToken Support',
                email: this.configService.get('EMAIL_USER'),
            },
            subject: 'CharityToken email confirmation',
            html,
        })
    }

    public sendRecoveryLink(email: string) {
        const payload: TokenPayload = { email }

        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
            expiresIn: `${this.configService.get('JWT_VERIFICATION_TOKEN_EXPIRATION_TIME')}s`,
        })

        const link = `${this.configService.get('EMAIL_RECOVERY_URL')}?token=${token}`
        const html = recovery(this.configService.get('URL'), link)

        return this.emailService.sendMail({
            to: email,
            from: {
                name: 'CharityToken Support',
                email: this.configService.get('EMAIL_USER'),
            },
            subject: 'Your CharityToken password',
            html,
        })
    }

    public async resendConfirmationLink(email: string) {
        const user = await this.usersService.getByEmail(email)

        if (!user) {
            throw new HttpException('User not found', HttpStatus.OK)
        }

        if (user.isEmailConfirmed) {
            throw new HttpException('Email already confirmed', HttpStatus.OK)
        }

        await this.sendVerificationLink(user.email)

        return 'Check your email'
    }

    public async confirmEmail(email: string) {
        const user = await this.usersService.getByEmail(email)

        if (user.isEmailConfirmed) {
            return 'Your email already confirmed. Please return to the Charity Token app to login.'
        }

        await this.usersService.markEmailAsConfirmed(email)

        return 'Your email has been confirmed and your account has been created. Please return to the Charity Token app to login.'
    }

    public async recoveryPassword(email: string) {
        const user = await this.usersService.getByEmail(email)

        if (!user.isPasswordReseting) {
            return 'Temporary password was already sended to your account.'
        }

        user.isPasswordReseting = false
        await user.save()

        const password = Math.random().toString(36).slice(-8)
        const hashedPassword = await bcrypt.hash(password, 10)

        await this.usersService.setNewUserPassword(hashedPassword, user.id)

        const html = new_password(this.configService.get('URL'), password)

        await this.emailService.sendMail({
            to: email,
            from: {
                name: 'CharityToken Support',
                email: this.configService.get('EMAIL_USER'),
            },
            subject: 'Password changed',
            html,
        })

        return 'Your temporary password has been sent to your email. Please use it to log back into the Charity Token.'
    }

    public async decodeConfirmationToken(token: string) {
        try {
            const payload = await this.jwtService.verify(token, {
                secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
            })

            if (typeof payload === 'object' && 'email' in payload) {
                return payload.email
            }

            throw new HttpException('Invalid token', HttpStatus.OK)
        } catch (error) {
            if (error?.name === 'TokenExpiredError') {
                throw new HttpException('Email confirmation token expired', HttpStatus.OK)
            }

            throw new HttpException('Bad confirmation token', HttpStatus.OK)
        }
    }
}
