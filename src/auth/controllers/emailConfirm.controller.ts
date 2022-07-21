import { Controller, Post, UseGuards, Req, Get, Query, Render } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { MessageDto } from 'src/common/dto/message.dto'
import { ConfirmEmailDto } from '../dto/confirmEmail.dto'
import { JwtGuard } from '../guards/jwt.guard'
import { RequestWithUser } from '../interfaces/requestWithUser.interface'
import { EmailConfirmService } from '../services/emailConfirm.service'

@ApiTags('Authentication')
@Controller('email')
export class EmailConfirmController {
    constructor(private readonly emailConfirmService: EmailConfirmService) {}

    //============================================================================================
    // USER: CONFIRM EMAIL
    //============================================================================================
    @ApiOperation({
        summary: 'USER: CONFIRM EMAIL',
        description: 'Checks access token and sets user status to ACTIVE',
    })
    @ApiResponse({ status: 200 })
    @Get('confirm')
    @Render('confirmed.hbs')
    async confirm(@Query() query: ConfirmEmailDto) {
        const email = await this.emailConfirmService.decodeConfirmationToken(query.token)
        const message = await this.emailConfirmService.confirmEmail(email)
        return { message }
    }

    //============================================================================================
    // USER: CONFIRM RECOVERY
    //============================================================================================
    @ApiOperation({
        summary: 'USER: CONFIRM RECOVERY',
        description: 'Checks access token and sets new user password',
    })
    @ApiResponse({ status: 200 })
    @Get('recovery')
    @Render('password_changed.hbs')
    async recovery(@Query() query: ConfirmEmailDto) {
        const email = await this.emailConfirmService.decodeConfirmationToken(query.token)
        const message = await this.emailConfirmService.recoveryPassword(email)
        return { message }
    }

    //============================================================================================
    // USER: RESEND CONFIRMATION LINK
    //============================================================================================
    @ApiOperation({
        summary: 'USER: RESEND CONFIRMATION LINK',
        description: 'Generates and sends new email verification link',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Post('resendlink')
    @UseGuards(JwtGuard)
    async resendConfirmationLink(@Req() request: RequestWithUser) {
        const message = await this.emailConfirmService.resendConfirmationLink(request.user.email)
        return { message }
    }
}
