import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '../../users/users.service'
import { ConfigService } from '@nestjs/config'
import { google, Auth } from 'googleapis'
import { AuthService } from './auth.service'
import { User } from 'src/users/models/users.model'

@Injectable()
export class GoogleAuthService {
    oauthClient: Auth.OAuth2Client
    constructor(
        private usersService: UsersService,
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        const clientID = this.configService.get('GOOGLE_AUTH_CLIENT_ID')
        const clientSecret = this.configService.get('GOOGLE_AUTH_CLIENT_SECRET')
        this.oauthClient = new google.auth.OAuth2(clientID, clientSecret)
    }

    async getUserData(token: string) {
        const userInfoClient = google.oauth2('v2').userinfo

        this.oauthClient.setCredentials({
            access_token: token,
        })

        const userInfoResponse = await userInfoClient.get({
            auth: this.oauthClient,
        })

        return userInfoResponse.data
    }

    async getCookiesForUser(user: User) {
        const accessTokenCookie = await this.authService.getCookieWithJwtAccessToken(user)

        const { cookie: refreshTokenCookie, token: refreshToken } = await this.authService.getCookieWithJwtRefreshToken(
            user,
        )

        await this.usersService.setCurrentRefreshToken(refreshToken, user.id)

        return {
            accessTokenCookie,
            refreshTokenCookie,
        }
    }

    async handleRegisteredUser(user: User) {
        if (!user.isRegisteredWithGoogle) {
            throw new UnauthorizedException()
        }

        const { accessTokenCookie, refreshTokenCookie } = await this.getCookiesForUser(user)

        return {
            accessTokenCookie,
            refreshTokenCookie,
            user,
        }
    }

    async registerUser(token: string, email: string) {
        const userData = await this.getUserData(token)
        const name = userData.name
        const user = await this.usersService.createWithGoogle(email, name)
        return this.handleRegisteredUser(user)
    }

    async authenticate(token: string) {
        const tokenInfo = await this.oauthClient.getTokenInfo(token)
        const email = tokenInfo.email

        try {
            const user = await this.usersService.getByEmail(email)
            return this.handleRegisteredUser(user)
        } catch (error) {
            if (error.status !== 404) throw new error()
            return this.registerUser(token, email)
        }
    }
}
