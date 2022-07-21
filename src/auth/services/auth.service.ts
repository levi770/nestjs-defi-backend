import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { UsersService } from '../../users/users.service'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { TokenPayload } from '../interfaces/tokenPayload.interface'
import { User } from 'src/users/models/users.model'
import { RegisterDto } from '../dto/register.dto'
import { RolesService } from 'src/roles/roles.service'
import { WalletService } from 'src/wallet/wallet.service'

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private roleService: RolesService,
        private walletService: WalletService,
    ) {}

    public async register(registrationData: RegisterDto) {
        const hashedPassword = await bcrypt.hash(registrationData.password, 10)
        const role = await this.roleService.getRoleByValue('USER')
        const eth = await this.walletService.getNewAccount()
        const createdUser = await this.usersService.createUser(role, [eth], {
            ...registrationData,
            password: hashedPassword,
        })

        return createdUser
    }

    public async registerAdmin(registrationData: RegisterDto) {
        const hashedPassword = await bcrypt.hash(registrationData.password, 10)

        const role = await this.roleService.getSuperAdminRole()
        if (!role) throw new HttpException('Super admin already exists', HttpStatus.OK)

        const eth = await this.walletService.getNewAccount()
        const createdUser = await this.usersService.createAdmin(role, [eth], {
            ...registrationData,
            password: hashedPassword,
        })

        return createdUser
    }

    public async getCookieWithJwtAccessToken(user: User, isSecondFactorAuthenticated = false) {
        const payload: TokenPayload = {
            userId: user.id,
            isSecondFactorAuthenticated,
            user_roles: user.user_roles,
        }

        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
            expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`,
        })

        if (process.env.NAME === 'base') {
            return `Authentication=${token}; SameSite=None; Secure; HttpOnly; Path=/; Max-Age=${this.configService.get(
                'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
            )}`
        }

        return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
            'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
        )}`
    }

    public async getCookieWithJwtRefreshToken(user: User) {
        const payload: TokenPayload = { userId: user.id, user_roles: user.user_roles }

        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`,
        })

        let cookie = null
        if (process.env.NAME === 'base') {
            cookie = `Refresh=${token}; SameSite=None; Secure; HttpOnly; Path=/; Max-Age=${this.configService.get(
                'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
            )}`
        } else {
            cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
                'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
            )}`
        }

        return {
            cookie,
            token,
        }
    }

    public getCookiesForLogOut() {
        return ['Authentication=; HttpOnly; Path=/; Max-Age=0', 'Refresh=; HttpOnly; Path=/; Max-Age=0']

        if (process.env.NAME === 'base') {
            return [
                'Authentication=; SameSite=None; Secure; HttpOnly; Path=/; Max-Age=0',
                'Refresh=; SameSite=None; Secure; HttpOnly; Path=/; Max-Age=0',
            ]
        }

        return ['Authentication=; HttpOnly; Path=/; Max-Age=0', 'Refresh=; HttpOnly; Path=/; Max-Age=0']
    }

    public async getAuthenticatedUser(email: string, plainTextPassword: string) {
        try {
            let user = await this.usersService.getByEmail(email)
            await this.verifyPassword(plainTextPassword, user.password)
            user = await this.usersService.getUserById(user.id)

            return user
        } catch (error) {
            throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST)
        }
    }

    private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
        const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword)

        if (!isPasswordMatching) {
            throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST)
        }
    }

    public async getUserFromAuthenticationToken(token: string) {
        const payload: TokenPayload = this.jwtService.verify(token, {
            secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        })

        if (payload.userId) {
            return await this.usersService.getUserById(payload.userId)
        }
    }

    public async getRequestUserFromAuthenticationToken(token: string) {
        const payload: TokenPayload = this.jwtService.verify(token, {
            secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        })

        if (payload.userId) {
            return payload
        }
    }
}
