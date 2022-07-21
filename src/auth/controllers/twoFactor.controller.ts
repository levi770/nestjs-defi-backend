import { Controller, Post, Res, UseGuards, Req, Body, HttpException, HttpStatus } from '@nestjs/common'
import { FastifyReply } from 'fastify'
import { TwoFactorService } from '../services/twoFactor.service'
import { JwtGuard } from '../guards/jwt.guard'
import { RequestWithUser } from '../interfaces/requestWithUser.interface'
import { UsersService } from '../../users/users.service'
import { TwoFactorAuthenticationCodeDto } from '../dto/twoFactorCode.dto'
import { AuthService } from '../services/auth.service'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { User } from 'src/users/models/users.model'

@ApiTags('Authentication')
@Controller('2fa')
export class TwoFactorController {
    constructor(
        private twoFactorService: TwoFactorService,
        private usersService: UsersService,
        private authService: AuthService,
    ) {}

    //============================================================================================
    // USER: GENERATE 2FA QR CODE
    //============================================================================================
    @ApiOperation({
        summary: 'USER: GENERATE 2FA QR CODE',
        description: 'Generates and returns image with qr code for Goolgle Auth activation',
    })
    @ApiResponse({ status: 200 })
    @Post('generate')
    @UseGuards(JwtGuard)
    async register(@Res() response: FastifyReply, @Req() request: RequestWithUser) {
        const { otpauthUrl } = await this.twoFactorService.generateTwoFactorSecret(request.user)

        response.headers({
            'Content-Disposition': `attachment; filename="2FA-qrcode.png"`,
            'Content-Type': 'image/png',
        })

        const stream = await this.twoFactorService.pipeQrCodeStream(otpauthUrl)

        return response.send(stream)
    }

    //============================================================================================
    // USER: TURN ON 2FA FOR ACCOUNT
    //============================================================================================
    @ApiOperation({
        summary: 'USER: TURN ON 2FA FOR ACCOUNT',
        description: 'Turning on 2FA for account',
    })
    @ApiResponse({ status: 200, type: '2FA enabeled' })
    @Post('turnon')
    @UseGuards(JwtGuard)
    async turnOnTwoFactorAuthentication(
        @Req() request: RequestWithUser,
        @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
    ) {
        const isCodeValid = this.twoFactorService.isTwoFactorCodeValid(twoFactorAuthenticationCode, request.user)

        if (!isCodeValid) throw new HttpException('Wrong authentication code', HttpStatus.UNAUTHORIZED)

        await this.usersService.turnOnTwoFactor(request.user.id)

        return '2FA enabeled'
    }

    //============================================================================================
    // USER: TURN OFF 2FA FOR ACCOUNT
    //============================================================================================
    @ApiOperation({
        summary: 'USER: TURN OFF 2FA FOR ACCOUNT',
        description: 'Turning off 2FA for account',
    })
    @ApiResponse({ status: 200, type: '2FA disabled' })
    @Post('turnoff')
    @UseGuards(JwtGuard)
    async turnOffTwoFactorAuthentication(
        @Req() request: RequestWithUser,
        @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
    ) {
        const isCodeValid = this.twoFactorService.isTwoFactorCodeValid(twoFactorAuthenticationCode, request.user)
        if (!isCodeValid) throw new HttpException('Wrong authentication code', HttpStatus.UNAUTHORIZED)
        await this.usersService.turnOffTwoFactor(request.user.id)
        return '2FA disabled'
    }

    //============================================================================================
    // USER: AUTHENTICATE WITH 2FA
    //============================================================================================
    @ApiOperation({
        summary: 'USER: AUTHENTICATE WITH 2FA',
        description: 'Checks Google 2FA code, generates access and refresh token and set them to cookies',
    })
    @ApiResponse({ status: 200, type: User })
    @Post('authenticate')
    @UseGuards(JwtGuard)
    async authenticate(
        @Req() request: RequestWithUser,
        @Res({ passthrough: true }) response: FastifyReply,
        @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
    ) {
        const isCodeValid = this.twoFactorService.isTwoFactorCodeValid(twoFactorAuthenticationCode, request.user)
        if (!isCodeValid) throw new HttpException('Wrong authentication code', HttpStatus.UNAUTHORIZED)
        const accessTokenCookie = await this.authService.getCookieWithJwtAccessToken(request.user, true)
        response.header('Set-Cookie', [accessTokenCookie])
        return request.user
    }
}
