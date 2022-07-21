import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { User } from './models/users.model'
import { UsersService } from './users.service'
import { UserDataDto } from './dto/user-data.dto'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { Roles } from 'src/roles/guards/roles-auth.decorator'
import { RolesGuard } from 'src/roles/guards/roles.guard'
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface'
import { PaginateDto } from 'src/common/dto/paginate.dto'
import { IdDto } from 'src/common/dto/id.dto'
import { MessageDto } from 'src/common/dto/message.dto'
import { SearchUserDto } from './dto/search-user.dto'
import { UserPasswordDto } from './dto/user-password.dto'
import { BlockUserDto } from './dto/block-user.dto'
import { DeviceTokenDto } from './dto/device.dto'
import { NotificationsService } from 'src/common/notifications/notifications.service'
import { NotificationsFilterDto } from 'src/common/notifications/dto/notifications-filter.dto'
import { EmailGuard } from 'src/auth/guards/email.guard'

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private notificationsService: NotificationsService, private userService: UsersService) {}

    //===============================================================================================
    // USER: REGISTER USER DEVICE
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: REGISTER USER DEVICE',
        description: 'Provide firebase token to register user device',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Post('set')
    async addNewDevice(@Req() request: RequestWithUser, @Body() body: DeviceTokenDto) {
        const result = await this.userService.setDeviceToken(request.user.id, body.token)
        return { message: result[0] ? 'Device registered' : 'Device not registered' }
    }

    //============================================================================================
    // USER: UPDATE USER DATA
    //============================================================================================
    @ApiOperation({
        summary: 'USER: UPDATE USER DATA',
        description: 'Updates user data entity in database',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Post('data')
    async updateByUser(@Req() request: RequestWithUser, @Body() userDataDto: UserDataDto) {
        const result = await this.userService.updateUserData(request.user, userDataDto)
        return { message: result[0] ? 'Data updated' : 'Data not found' }
    }

    //============================================================================================
    // USER: UPDATE USER PASSWORD
    //============================================================================================
    @ApiOperation({
        summary: 'USER: UPDATE USER PASSWORD',
        description: 'Updates user password in database',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Post('password')
    async updatePasword(@Req() request: RequestWithUser, @Body() body: UserPasswordDto) {
        const result = await this.userService.updateUserPassword(request.user, body.password)

        const title = 'User password'
        const ntbody = `{"message": "password_changed"}`
        await this.notificationsService.sendNotification(request.user, title, ntbody)

        return result
    }

    //============================================================================================
    // USER: UPDATE USER PASSWORD
    //============================================================================================
    @ApiOperation({
        summary: 'USER: DELETE USER',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Delete('delete')
    async delete(@Req() request: RequestWithUser) {
        return await this.userService.delete(request.user.id)
    }

    //============================================================================================
    // ADMIN: GET ALL USERS
    //============================================================================================
    @ApiOperation({
        summary: 'ADMIN: GET ALL USERS',
        description: 'Returns all users from database',
    })
    @ApiResponse({ status: 200, type: [User] })
    @Roles('SUPERADMIN', 'ADMIN')
    @UseGuards(JwtGuard, RolesGuard)
    @Get()
    getAll(@Query() query?: PaginateDto) {
        return this.userService.getAllUsers(query)
    }

    //============================================================================================
    // ADMIN: GET ONE USER BY ID
    //============================================================================================
    @ApiOperation({
        summary: 'ADMIN: GET ONE USER BY ID',
        description: 'Returns one user from database by provided ID ',
    })
    @ApiResponse({ status: 200, type: User })
    @Roles('SUPERADMIN', 'ADMIN')
    @UseGuards(JwtGuard, RolesGuard)
    @Get(':id')
    getOne(@Param() param: IdDto) {
        return this.userService.getUserById(param.id)
    }

    //============================================================================================
    // ADMIN: SEARCH ONE USER
    //============================================================================================
    @ApiOperation({
        summary: 'ADMIN: SEARCH ONE USER',
        description: 'Return one user from batabase by provided string',
    })
    @ApiResponse({ status: 200, type: User })
    @Roles('SUPERADMIN', 'ADMIN')
    @UseGuards(JwtGuard, RolesGuard)
    @Get('search/:value')
    search(@Param() param: SearchUserDto) {
        return this.userService.searchUser(param.value)
    }

    //============================================================================================
    // ADMIN: BLOCK USER BY ID
    //============================================================================================
    @ApiOperation({
        summary: 'ADMIN: BLOCK USER BY ID',
        description: 'Sets user status to BLOCKED',
    })
    @ApiResponse({ status: 200, type: User })
    @Roles('SUPERADMIN', 'ADMIN')
    @UseGuards(JwtGuard, RolesGuard)
    @Patch(':id/block')
    blockUser(@Param() param: IdDto, @Body() body: BlockUserDto) {
        return this.userService.blockUser(param.id, body.reason)
    }

    //============================================================================================
    // ADMIN: ACTIVATE USER BY ID
    //============================================================================================
    @ApiOperation({
        summary: 'ADMIN: ACTIVATE USER BY ID',
        description: 'Sets user status to ACTIVE',
    })
    @ApiResponse({ status: 200, type: User })
    @Roles('SUPERADMIN', 'ADMIN')
    @UseGuards(JwtGuard, RolesGuard)
    @Patch(':id/activate')
    activateUser(@Param() param: IdDto, @Body() body: BlockUserDto) {
        return this.userService.activateUser(param.id, body.reason)
    }

    //============================================================================================
    //============================================================================================
    @ApiOperation({ summary: 'USER: GET ALL USER NOTIFICATIONS' })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get('notifications')
    async getAllUserNotifications(@Req() request: RequestWithUser, @Query() filter?: NotificationsFilterDto) {
        return await this.notificationsService.getAllUserNotificationsWithFilter(request.user, filter)
    }

    //============================================================================================
    //============================================================================================
    @ApiOperation({ summary: 'USER: GET ONE USER NOTIFICATION' })
    @ApiResponse({ status: 200 })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get('notifications/:id')
    async getOneUserNotification(@Req() request: RequestWithUser, @Param() param: IdDto) {
        return await this.notificationsService.getOneUserNotification(request.user.id, param.id)
    }

    //============================================================================================
    //============================================================================================
    @ApiOperation({ summary: 'USER: TEST NOTIFICATIONS' })
    @ApiResponse({ status: 200 })
    @Get('notifications/test/:id')
    async test(@Param() param: IdDto) {
        const user = await this.userService.getUserById(param.id)

        const title = 'Test'
        const body = `{"user": "${user.id}"}`
        const result = await this.notificationsService.sendNotification(user, title, body)

        return result && result.failureCount === 0 ? 'OK' : 'FAIL'
    }
}
