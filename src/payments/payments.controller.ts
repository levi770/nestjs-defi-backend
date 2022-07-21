import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface'
import { AddressDto } from 'src/common/dto/address.dto'
import { Roles } from 'src/roles/guards/roles-auth.decorator'
import { RolesGuard } from 'src/roles/guards/roles.guard'
import { UsersService } from 'src/users/users.service'
import { CallbackDto } from './dto/callback.dto'
import { PaymentIdDto } from './dto/payment-id.dto'
import { PaymentsFilterDto } from './dto/payments-filter.dto'
import { RateDto } from './dto/rate.dto'
import { TransactionDto } from './dto/transaction.dto'
import { PaymentsService } from './payments.service'
import { Payment } from './models/payment.model'
import { EmailGuard } from 'src/auth/guards/email.guard'

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    constructor(private usersService: UsersService, private paymentsService: PaymentsService) {}

    //===============================================================================================
    // USER: CURRENCIES LIST
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: CURRENCIES LIST',
        description: 'Returns currencies list from Indacoin API',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get('currencies')
    async getCurrencies() {
        return await this.paymentsService.getCurrencies()
    }

    //===============================================================================================
    // USER: CURRENCY RATE
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: CURRENCY RATE',
        description: 'Returns currency exchange rate from Indacoin API',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get('currencies/rate')
    async getCurrencyRate(@Query() rate: RateDto) {
        return await this.paymentsService.getCurrencyRate(rate)
    }

    //===============================================================================================
    // USER: CREATE TRANSACTION
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: CREATE TRANSACTION',
        description: 'Generates new transaction and redirects user to Indacoin Payment page',
    })
    @ApiResponse({ status: 200, type: 'string' })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Post('transaction')
    async newTransaction(@Req() request: RequestWithUser, @Body() transaction: TransactionDto) {
        return await this.paymentsService.newTransaction(request.user, transaction)
    }

    //===============================================================================================
    // USER: ALL USER PAYMENTS
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: ALL USER PAYMENTS',
        description: 'Returns all user payments to Indacoin API. Accepts optional body parameter "filter"',
    })
    @ApiResponse({ status: 200, type: [Payment] })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get('all/:address')
    async getAllUserPayments(
        @Req() request: RequestWithUser,
        @Param() address: AddressDto,
        @Query() filter?: PaymentsFilterDto,
    ) {
        return await this.paymentsService.getAllUserPaymentsWithFilter(request.user, address.address, filter)
    }

    //===============================================================================================
    // USER: ONE USER PAYMENT
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: ONE USER PAYMENT',
        description:
            'Returns one user payment to Indacoin API. Accepts "id" query parameter with paymentId or transactionId',
    })
    @ApiResponse({ status: 200, type: Payment })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get('one/:address')
    async getOneUserPayment(
        @Req() request: RequestWithUser,
        @Param() address: AddressDto,
        @Query() paymentId: PaymentIdDto,
    ) {
        return await this.paymentsService.getOneUserPayment(request.user, address.address, paymentId.id)
    }

    //===============================================================================================
    // ADMIN: ALL PAYMENTS
    //===============================================================================================
    @ApiOperation({
        summary: 'ADMIN: ALL PAYMENTS.',
        description: `Returns all payments to Indacoin API. Accepts optional body parameter "filter"`,
    })
    @ApiResponse({ status: 200, type: [Payment] })
    @Roles('SUPERADMIN', 'ADMIN')
    @UseGuards(JwtGuard, RolesGuard)
    @Get('all')
    async getAllPayments(@Req() request: RequestWithUser, @Query() filter?: PaymentsFilterDto) {
        return await this.paymentsService.getAllPaymentsWithFilter(filter)
    }

    //===============================================================================================
    // ADMIN: ONE PAYMENT
    //===============================================================================================
    @ApiOperation({
        summary: 'ADMIN: ONE USER PAYMENT',
        description: `Returns one payment to Indacoin API. Accepts "id" query parameter with paymentId or transactionId`,
    })
    @ApiResponse({ status: 200, type: Payment })
    @Roles('SUPERADMIN', 'ADMIN')
    @UseGuards(JwtGuard, RolesGuard)
    @Get('one')
    async getOnePayment(@Query() paymentId: PaymentIdDto) {
        return await this.paymentsService.getOnePayment(paymentId.id)
    }

    //===============================================================================================
    // USER: INDACOIN CALBACK
    //===============================================================================================
    @Post('callback')
    async callback(@Req() request, @Body() callback: CallbackDto) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const sign = request.rawHeaders[request.rawHeaders.findIndex((x) => x === 'Gw-Sign') + 1]
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const nonce = request.rawHeaders[request.rawHeaders.findIndex((x) => x === 'Gw-Nonce') + 1]
        // TO DO: check signature

        return await this.paymentsService.callback(callback)
    }
}
