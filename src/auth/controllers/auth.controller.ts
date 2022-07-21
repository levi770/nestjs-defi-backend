import { Body, Req, Res, Controller, HttpCode, Post, UseGuards, Get, HttpException, HttpStatus } from '@nestjs/common'
import { FastifyReply } from 'fastify'
import { AuthService } from '../services/auth.service'
import { RegisterDto } from '../dto/register.dto'
import { RequestWithUser } from '../interfaces/requestWithUser.interface'
import { LocalGuard } from '../guards/local.guard'
import { JwtGuard } from '../guards/jwt.guard'
import { UsersService } from '../../users/users.service'
import { RefreshGuard } from '../guards/refresh.guard'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { User } from 'src/users/models/users.model'
import { RecoveryDto } from '../dto/recovery.dto'
import { LogInDto } from '../dto/logIn.dto'
import { EmailConfirmService } from '../services/emailConfirm.service'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private emailConfirmService: EmailConfirmService,
    ) {}

    //===============================================================================================
    // CREATE SUPERADMIN
    //===============================================================================================
    @Post('super')
    async createAdmin(@Body() registrationData: RegisterDto) {
        const user = await this.authService.registerAdmin(registrationData)
        //await this.emailConfirmService.sendVerificationLink(registrationData.email)
        return user
    }

    //============================================================================================
    // PUBLIC: REGISTRATION
    //============================================================================================
    @ApiOperation({
        summary: 'PUBLIC: REGISTRATION',
        description: 'Creates new user and sends email with verification link',
    })
    @ApiResponse({ status: 200, type: User })
    @Post('register')
    async register(@Body() registrationData: RegisterDto) {
        if (+registrationData.age < 18) throw new HttpException('You must be 18+', HttpStatus.OK)

        await this.authService.register(registrationData)
        await this.emailConfirmService.sendVerificationLink(registrationData.email)
        return 'Email confirmation link sended to your email'
    }

    //============================================================================================
    // PUBLIC: LOGIN
    //============================================================================================
    @ApiOperation({
        summary: 'PUBLIC: LOGIN',
        description: 'Regular authentication, generates access and refresh tokens and sets them in cookies',
    })
    @ApiResponse({ status: 200, type: User })
    @UseGuards(LocalGuard)
    @Post('login')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async logIn(
        @Req() request: RequestWithUser,
        @Res({ passthrough: true }) response: FastifyReply,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Body() body: LogInDto,
    ) {
        const { user } = request
        const accessTokenCookie = await this.authService.getCookieWithJwtAccessToken(user)
        const { cookie: refreshTokenCookie, token: refreshToken } = await this.authService.getCookieWithJwtRefreshToken(
            user,
        )

        await this.usersService.setCurrentRefreshToken(refreshToken, user.id)
        response.header('Set-Cookie', [accessTokenCookie, refreshTokenCookie])
        if (user.isTwoFactorAuthenticationEnabled) return '2FA enabled'

        return user
    }

    //============================================================================================
    // USER: LOGOUT
    //============================================================================================
    @ApiOperation({
        summary: 'USER: LOGOUT',
        description: 'Erased cookies with tokens',
    })
    @ApiResponse({ status: 200 })
    @UseGuards(JwtGuard)
    @Post('logout')
    @HttpCode(200)
    async logOut(@Req() request: RequestWithUser, @Res({ passthrough: true }) response: FastifyReply) {
        await this.usersService.removeRefreshToken(request.user.id)
        response.header('Set-Cookie', this.authService.getCookiesForLogOut())
        return { message: 'Success' }
    }

    //============================================================================================
    // USER: ME
    //============================================================================================
    @ApiOperation({ summary: 'USER: ME', description: 'Returns current user entity' })
    @ApiResponse({ status: 200, type: User })
    @UseGuards(JwtGuard)
    @Get()
    authenticate(@Req() request: RequestWithUser) {
        return request.user
    }

    //============================================================================================
    // USER: REFRESH ACCESS TOKEN
    //============================================================================================
    @ApiOperation({
        summary: 'USER: REFRESH ACCESS TOKEN',
        description: 'Generates new access token from refresh token',
    })
    @ApiResponse({ status: 200, type: User })
    @UseGuards(RefreshGuard)
    @Get('refresh')
    async refresh(@Req() request: RequestWithUser, @Res({ passthrough: true }) response: FastifyReply) {
        const accessTokenCookie = await this.authService.getCookieWithJwtAccessToken(request.user)
        response.header('Set-Cookie', accessTokenCookie)
        return request.user
    }

    //============================================================================================
    // USER: PASSWORD RECOVERY
    //============================================================================================
    @ApiOperation({
        summary: 'USER: PASSWORD RECOVERY',
        description: 'Sends message with recovery link on user email',
    })
    @ApiResponse({ status: 200 })
    @Post('recovery')
    async recovery(@Body() body: RecoveryDto) {
        const user = await this.usersService.getByEmail(body.email)
        if (!user) throw new HttpException('User with this email not found', HttpStatus.OK)

        user.isPasswordReseting = true
        await user.save()

        await this.emailConfirmService.sendRecoveryLink(body.email)

        return { message: 'Message with recovery link sended on your email' }
    }
}
