import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    Param,
    Patch,
    UseGuards,
    Delete,
    HttpException,
    HttpStatus,
    UseInterceptors,
    CacheKey,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { RolesGuard } from 'src/roles/guards/roles.guard'
import { Roles } from 'src/roles/guards/roles-auth.decorator'
import { ContactDto } from './dto/contact.dto'
import { TransferDto } from './dto/transfer.dto'
import { ReceiveDto } from './dto/receive.dto'
import { WalletService } from './wallet.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface'
import { UserAddressDto } from './dto/userAddress.dto'
import { PaginateDto } from 'src/common/dto/paginate.dto'
import { DonationDto } from './dto/donation.dto'
import { LabelDto } from './dto/label.dto'
import { NameDto } from './dto/name.dto'
import { AddressDto } from 'src/common/dto/address.dto'
import { TransferFilterDto } from './dto/transfer-filter.dto'
import { Transfer } from './models/transfer.model'
import { OrganizationsService } from 'src/organizations/organizations.service'
import { GetTransferDto } from './dto/get-transfer.dto'
import { RewardsDto } from './dto/rewards.dto'
import { RewardsQueryDto } from './dto/rewards-query.dto'
import { SwapTokensDto } from './dto/swap.dto'
import { Swap } from './models/swaps.model'
import { SwapsFilterDto } from './dto/swaps-filter.dto'
import { SwapIdDto } from './dto/swap-id.dto'
import { TxSatatusIdDto } from './dto/txstatus-id.dto'
import { TxSatatusBodyDto } from './dto/txstatus-body.dto'
import { NotificationsService } from 'src/common/notifications/notifications.service'
import { CurrentDto } from './dto/current.dto'
import { HttpCacheInterceptor } from 'src/common/interceptors/httpCache.interceptor'
import { SWAP_PRICES_CURRENT_CACHE_KEY } from 'src/common/constants/swap.constants'
import { EmailGuard } from 'src/auth/guards/email.guard'

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
    constructor(
        private walletService: WalletService,
        private orgService: OrganizationsService,
        private notificationsService: NotificationsService,
    ) {}

    //#region CREATE

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: CREATE NEW CUSTODY WALLET',
        description: 'Creates new custody user wallet in db',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Post('create')
    createNewAddress(@Req() request: RequestWithUser) {
        return this.walletService.createNewAccount(request.user)
    }

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: ADD EXTERNAL USER WALLET ADDRESS',
        description: 'Adds new non-custody user wallet address in db',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Post('add')
    addNewAddress(@Req() request: RequestWithUser, @Body() userAddress: UserAddressDto) {
        return this.walletService.addUserAddress(request.user, userAddress)
    }

    //#endregion

    //#region GET

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: GET ALL USER ADDRESSES',
        description: 'Returns user wallet addresses',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get('all')
    getAllAdresses(@Req() request: RequestWithUser) {
        return this.walletService.getAllAdresses(request.user.id)
    }

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: GET USER BALANCE',
        description: 'Returns user tokens balance',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get(':address/balance')
    async getBalance(@Req() request: RequestWithUser, @Param() userAddress: UserAddressDto) {
        return await this.walletService.getBalance(request.user, userAddress.address)
    }

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: GET BLOCKCHAIN CONNECTION',
        description: 'Returns current blockchain connection endpoint',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get('connection')
    async getConnection() {
        return await this.walletService.getConnectionData()
    }

    //#endregion

    //#region UPDATE

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: UPDATE ADRESS LABEL',
        description: 'Updates user address label',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Patch(':address')
    async updateLabel(@Req() request: RequestWithUser, @Param() userAddress: UserAddressDto, @Body() body: LabelDto) {
        const result = await this.walletService.updateLabel(request.user, userAddress, body)
        return result[0] ? 'Address updated' : 'Address not found'
    }

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: UPDATE TRANSACTION STATUS',
        description: 'Provide swapId and transaction hash after sending transaction with web3',
    })
    @ApiResponse({ status: 200, type: 'Swap transaction status' })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Patch(':txType/status/:txId')
    async updateSwapStatus(
        @Req() request: RequestWithUser,
        @Param() param: TxSatatusIdDto,
        @Body() hash: TxSatatusBodyDto,
    ) {
        return await this.walletService.updateStatus(request.user, param, hash.txHash)
    }

    //#endregion

    //#region DELETE

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: DELETE USER ADDRESS',
        description: 'Deletes user wallet address',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Delete(':address')
    async deleteAdress(@Req() request: RequestWithUser, @Param() userAddress: UserAddressDto) {
        const result = await this.walletService.deleteAdress(request.user, userAddress.address)
        return result ? 'Address deleted' : 'Address not found'
    }

    //#endregion

    //#region CONTACTS

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: ADD CONTACT ADDRESS',
        description: 'Adds new contact address in db',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Post('contacts/add')
    async addNewContact(@Req() request: RequestWithUser, @Body() contact: ContactDto) {
        const result = await this.walletService.addNewContact(request.user, contact)

        const title = 'New contact'
        const body = `{message: 'contact_created'}`
        await this.notificationsService.sendNotification(request.user, title, body)

        return result
    }

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: GET ALL CONTACTS',
        description: 'Returns all contacts',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get('contacts/all')
    getAllContacts(@Req() request: RequestWithUser, @Query() paginate: PaginateDto) {
        return this.walletService.getAllContacts(request.user, paginate)
    }

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: UPDATE CONTACT NAME',
        description: 'Updates contact name',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Patch('contact/:address')
    async updateContact(@Req() request: RequestWithUser, @Param() userAddress: UserAddressDto, @Body() body: NameDto) {
        const result = await this.walletService.updateContact(request.user, userAddress.address, body.name)

        const title = 'Update contact'
        const msgbody = `{message: 'contact_updated'}`
        await this.notificationsService.sendNotification(request.user, title, msgbody)

        return result
    }

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: DELETE CONTACT',
        description: 'Deletes contact',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Delete('contact/:address')
    async deleteContact(@Req() request: RequestWithUser, @Param() userAddress: UserAddressDto) {
        const result = await this.walletService.deleteContact(request.user, userAddress.address)
        return result ? 'Contact deleted' : 'Contact not found'
    }

    //#endregion

    //#region TRANSFERS

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: RECEIVE TRANSACTION',
        description: 'Generates qr code datauri with transaction data',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Post(':address/receive')
    receive(@Req() request: RequestWithUser, @Param() userAddress: UserAddressDto, @Body() receive: ReceiveDto) {
        return this.walletService.receive(request.user, userAddress.address, receive)
    }

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: TRANSFER TOKENS TO CONTACT',
        description: 'Generates transfer tokens to contact transaction',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Post(':address/transfer')
    async transfer(
        @Req() request: RequestWithUser,
        @Param() userAddress: UserAddressDto,
        @Body() transfer: TransferDto,
    ) {
        const address = await this.walletService.getUserWalletByString(request.user.id, userAddress.address)

        if (!address) {
            throw new HttpException('User address not found', HttpStatus.OK)
        }

        if (address.type === 'eth') {
            return this.walletService.transferCust(request.user, address, transfer)
        }

        return this.walletService.transferExt(request.user, userAddress.address, transfer)
    }

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: DONATE TOKENS TO ORGANIZATION',
        description: 'Generates transfer tokens to organization transaction',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Post(':address/donate')
    async donate(@Req() request: RequestWithUser, @Param() userAddress: UserAddressDto, @Body() donate: DonationDto) {
        const address = await this.walletService.getUserWalletByString(request.user.id, userAddress.address)

        if (!address) {
            throw new HttpException('User address not found', HttpStatus.OK)
        }

        if (donate.to === 'all') {
            if (address.type === 'eth') {
                return this.walletService.donationToAllCust(request.user, address, donate)
            }

            return this.walletService.donationToAllExt(request.user, address.address, donate)
        }

        const org = await this.orgService.getOneById(donate.to)

        if (!org || org.status !== 'ACTIVE') {
            throw new HttpException('Organisation not found or not active', HttpStatus.OK)
        }

        if (address.type === 'eth') {
            return this.walletService.donationCust(request.user, address, org.address, donate)
        }

        return this.walletService.donationExt(request.user, address.address, org.address, donate)
    }

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: GET ALL USER TRANSFERS',
        description: `Returns array of user transfer transactions.`,
    })
    @ApiResponse({ status: 200, type: [Transfer] })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get(':address/transactions')
    getAllUserTransfers(
        @Req() request: RequestWithUser,
        @Param() param: AddressDto,
        @Query() filter: TransferFilterDto,
    ) {
        return this.walletService.getAllUserTransfersWithFilter(request.user, param.address, filter)
    }

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: ONE USER TRANSFERS',
        description: 'Returns one user transfer transaction.',
    })
    @ApiResponse({ status: 200, type: Transfer })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get(':address/transactions/:txId')
    async getOneUserTransfer(@Req() request: RequestWithUser, @Param() param: GetTransferDto) {
        return await this.walletService.getOneUserTransfer(request.user, param)
    }

    //#endregion

    //#region REWARDS

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: GET CURRENT REWARDS',
        description: 'Returns token rewards for provided address and token symbol',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get(':address/rewards/:token/current')
    async getRewards(@Req() request: RequestWithUser, @Param() rewards: RewardsDto) {
        return await this.walletService.getRewards(request.user, rewards.address, rewards.token)
    }

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: GET REWARDS HISTORY',
        description: 'Returns token rewards history for provided address and token symbol',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get(':address/rewards/:token/history')
    async getRewardsHistory(
        @Req() request: RequestWithUser,
        @Param() rewards: RewardsDto,
        @Query() query: RewardsQueryDto,
    ) {
        return await this.walletService.getRewardsHistory(request.user, rewards.address, rewards.token, query)
    }

    //#endregion

    //#region SWAP

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: SWAP TOKENS',
        description: `Swaps tokens/MATIC to tokens/MATIC`,
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Post(':address/swap')
    async swap(@Req() request: RequestWithUser, @Param() userAddress: UserAddressDto, @Body() swap: SwapTokensDto) {
        const address = await this.walletService.getUserWalletByString(request.user.id, userAddress.address)

        if (!address) {
            throw new HttpException('User address not found', HttpStatus.OK)
        }

        if (address.type === 'eth') {
            return this.walletService.swapCust(request.user, address, swap)
        }

        return this.walletService.swapExt(request.user, userAddress.address, swap)
    }

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: GET ALL USER SWAPS',
        description: `Returns array of user swap transactions.`,
    })
    @ApiResponse({ status: 200, type: [Swap] })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get(':address/swap')
    getAllUserSwaps(
        @Req() request: RequestWithUser,
        @Param() userAddress: UserAddressDto,
        @Query() filter: SwapsFilterDto,
    ) {
        return this.walletService.getAllUserSwapsWithFilter(request.user, userAddress.address, filter)
    }

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: ONE USER SWAP',
        description: 'Returns one user swap transaction.',
    })
    @ApiResponse({ status: 200, type: Swap })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get(':address/swap/:swapId')
    async getOneUserPayment(@Req() request: RequestWithUser, @Param() param: SwapIdDto) {
        return await this.walletService.getOneUserSwap(request.user, param)
    }

    //===============================================================================================
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: GET CURRENT PRICES FROM PANCAKE',
    })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @UseInterceptors(HttpCacheInterceptor)
    @CacheKey(SWAP_PRICES_CURRENT_CACHE_KEY)
    @Get('price')
    priceCurrent(@Query() price: CurrentDto) {
        return this.walletService.getPrice(price)
    }

    //#endregion
}
