import { Controller, UseGuards, Get, Post, Req, Body, Param } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface'
import { MessageDto } from 'src/common/dto/message.dto'
import { Roles } from 'src/roles/guards/roles-auth.decorator'
import { RolesGuard } from 'src/roles/guards/roles.guard'
import { EmergencyDto } from './dto/emergency.dto'
import { FeesDto } from './dto/fees.dto'
import { LockManyDto } from './dto/lockMany.dto'
import { LockOneDto } from './dto/lockOne.dto'
import { RenewDto } from './dto/renew.dto'
import { SpecificDto } from './dto/specific.dto'
import { StartDto } from './dto/start.dto'
import { DepositDto } from './dto/deposit.dto'
import { PresaleService } from './presale.service'
import { ByTokenDto } from './dto/byToken.dto'
import { ByWithdrawalDto } from './dto/byWithdrawal.dto'
import { ByAddressDto } from './dto/byAddress.dto'
import { DeployDto } from './dto/deploy.dto'

@ApiTags('Presale')
@Controller('presale')
export class PresaleController {
    constructor(private presaleService: PresaleService) {}

    //============================================================================================
    // PRESALE_MANAGER: DEPLOY
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: START PRESALE',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Post('deploy')
    async deploy(@Req() request: RequestWithUser, @Body() body: DeployDto) {
        return await this.presaleService.deploy(request.user, body)
    }

    //============================================================================================
    // PRESALE_MANAGER: START PRESALE
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: START PRESALE',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Post('start')
    async start(@Req() request: RequestWithUser, @Body() body: StartDto) {
        return await this.presaleService.start(request.user, body)
    }

    //============================================================================================
    // PRESALE_MANAGER: END PRESALE
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: END PRESALE',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Get('end')
    async end(@Req() request: RequestWithUser) {
        return await this.presaleService.end(request.user)
    }

    //============================================================================================
    // PRESALE_MANAGER: ADD LIQUIDITY
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: ADD LIQUIDITY',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Get('liquidity')
    async liquidity(@Req() request: RequestWithUser) {
        return await this.presaleService.liquidity(request.user)
    }

    //============================================================================================
    // PRESALE_MANAGER: SET CHARITY TOKEN FEES
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: SET CHARITY TOKEN FEES',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Post('fees')
    async fees(@Req() request: RequestWithUser, @Body() body: FeesDto) {
        return await this.presaleService.fees(request.user, body)
    }

    //============================================================================================
    // PRESALE_MANAGER: WITHDRAW 20% MATIC AMOUNT TO DEV ACCOUNT
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: WITHDRAW 20% MATIC AMOUNT TO DEV ACCOUNT',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Get('withdraw/dev')
    async withdrawDev(@Req() request: RequestWithUser) {
        return await this.presaleService.withdrawDev(request.user)
    }

    //============================================================================================
    // PRESALE_MANAGER: WITHDRAW REST TOKENS AMOUNT TO DEV ACCOUNT
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: WITHDRAW REST TOKENS AMOUNT TO DEV ACCOUNT',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Get('withdraw/tokens')
    async withdrawTokens(@Req() request: RequestWithUser) {
        return await this.presaleService.withdrawTokens(request.user)
    }

    //============================================================================================
    // PRESALE_MANAGER: WITHDRAW LIQUIDITY TOKENS FROM POOL TO DEV ACCOUNT
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: WITHDRAW LIQUIDITY TOKENS FROM POOL TO DEV ACCOUNT',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Get('withdraw/liquidity')
    async withdrawLiquidity(@Req() request: RequestWithUser) {
        return await this.presaleService.withdrawLiquidity(request.user)
    }

    //============================================================================================
    // PRESALE_MANAGER: GET PRESALE CONTRACT DATA
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: GET PRESALE CONTRACT DATA',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Get('data')
    async data() {
        return await this.presaleService.data()
    }

    //============================================================================================
    // PRESALE_MANAGER: GET PRESALE DEPOSITS
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: GET PRESALE DEPOSITS',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Get('deposits')
    async deposits() {
        return await this.presaleService.deposits()
    }

    //============================================================================================
    // PRESALE_MANAGER: CREATE ONE TOKENS LOCK DEPOSIT
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: CREATE ONE TOKENS LOCK DEPOSIT',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Post('locker/lockOne')
    async lockOne(@Req() request: RequestWithUser, @Body() body: LockOneDto) {
        return await this.presaleService.lockOne(request.user, body)
    }

    //============================================================================================
    // PRESALE_MANAGER: CREATE MANY TOKENS LOCK DEPOSITS
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: CREATE MANY TOKENS LOCK DEPOSITS',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Post('locker/lockMany')
    async lockMany(@Req() request: RequestWithUser, @Body() body: LockManyDto) {
        return await this.presaleService.lockMany(request.user, body)
    }

    //============================================================================================
    // PRESALE_MANAGER: RENEW TOKENS LOCK DEPOSIT
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: RENEW TOKENS LOCK DEPOSIT',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Post('locker/renew')
    async renew(@Req() request: RequestWithUser, @Body() body: RenewDto) {
        return await this.presaleService.renew(request.user, body)
    }

    //============================================================================================
    // PRESALE_MANAGER: WITHDRAW DEPOSIT
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: WITHDRAW DEPOSIT',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Post('locker/withdraw/regular')
    async regular(@Req() request: RequestWithUser, @Body() body: DepositDto) {
        return await this.presaleService.regular(request.user, body)
    }

    //============================================================================================
    // PRESALE_MANAGER: EMERGENCY WITHDRAW DEPOSIT
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: EMERGENCY WITHDRAW DEPOSIT',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Post('locker/withdraw/emergency')
    async emergency(@Req() request: RequestWithUser, @Body() body: EmergencyDto) {
        return await this.presaleService.emergency(request.user, body)
    }

    //============================================================================================
    // PRESALE_MANAGER: WITHDRAW SPECIFIC DEPOSIT
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: WITHDRAW SPECIFIC DEPOSIT',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Post('locker/withdraw/specific')
    async specific(@Req() request: RequestWithUser, @Body() body: SpecificDto) {
        return await this.presaleService.specific(request.user, body)
    }

    //============================================================================================
    // PRESALE_MANAGER: GET CURRENT BLOCKCHAIN TIME
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: GET CURRENT BLOCKCHAIN TIME',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Get('locker/epoch')
    async epoch() {
        return await this.presaleService.epoch()
    }

    //============================================================================================
    // PRESALE_MANAGER: GET ALL DEPOSITS IDS
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: GET ALL DEPOSITS IDS',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Get('locker/deposits')
    async depositsIds() {
        return await this.presaleService.depositsIds()
    }

    //============================================================================================
    // PRESALE_MANAGER: GET DEPOSIT DETAILS
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: GET DEPOSIT DETAILS',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Get('locker/deposits/byId/:_id')
    async details(@Param() param: DepositDto) {
        return await this.presaleService.details(param)
    }

    //============================================================================================
    // PRESALE_MANAGER: GET ALL DEPOSITS BY TOKEN ADDRESS
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: GET ALL DEPOSITS BY TOKEN ADDRESS',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Get('locker/deposits/byToken/:_tokenAddress')
    async byToken(@Param() param: ByTokenDto) {
        return await this.presaleService.byToken(param)
    }

    //============================================================================================
    // PRESALE_MANAGER: GET ALL DEPOSITS BY WITHDRAWAL ADDRESS
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: GET ALL DEPOSITS BY WITHDRAWAL ADDRESS',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Get('locker/deposits/byWithdrawal/:_withdrawalAddress')
    async byWithdrawal(@Param() param: ByWithdrawalDto) {
        return await this.presaleService.byWithdrawal(param)
    }

    //============================================================================================
    // PRESALE_MANAGER: GET ALL DEPOSITS BY WITHDRAWAL ADDRESS
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: GET TOKENS BALANCE BY ADDRESS',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Post('locker/balance/byAddress')
    async byAddress(@Body() body: ByAddressDto) {
        return await this.presaleService.byAddress(body)
    }

    //============================================================================================
    // PRESALE_MANAGER: GET TOTAL TOKENS BALANCE
    //============================================================================================
    @ApiOperation({
        summary: 'PRESALE_MANAGER: GET TOTAL TOKENS BALANCE',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'PRESALE_MANAGER')
    @UseGuards(JwtGuard, RolesGuard)
    @Post('locker/balance/byToken/:_tokenAddress')
    async total(@Param() param: ByTokenDto) {
        return await this.presaleService.total(param)
    }
}
