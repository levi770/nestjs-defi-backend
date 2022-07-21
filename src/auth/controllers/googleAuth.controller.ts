import { Controller, Post, ClassSerializerInterceptor, UseInterceptors, Body, Req, Res } from '@nestjs/common'
import { FastifyReply } from 'fastify'
import { TokenVerificationDto } from '../dto/tokenVerification.dto'
import { GoogleAuthService } from '../services/googleAuth.service'
import { Request } from 'express'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('Authentication')
@Controller('googleauth')
@UseInterceptors(ClassSerializerInterceptor)
export class GoogleAuthController {
    constructor(private googleAuthService: GoogleAuthService) {}

    @ApiOperation({
        summary: 'GOOGLE AUTH FOR APPLICATIONS',
    })
    @Post()
    async authenticate(
        @Res({ passthrough: true }) response: FastifyReply,
        @Body() body: TokenVerificationDto,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Req() request: Request,
    ) {
        const { accessTokenCookie, refreshTokenCookie, user } = await this.googleAuthService.authenticate(body.token)

        response.header('Set-Cookie', [accessTokenCookie, refreshTokenCookie])

        return user
    }
}
