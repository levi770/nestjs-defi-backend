import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { IdDto } from 'src/common/dto/id.dto'
import { MessageDto } from 'src/common/dto/message.dto'
import { SetRoleDto } from 'src/users/dto/user-role.dto'
import { CreateRoleDto } from './dto/create-role.dto'
import { GetRoleDto } from './dto/get-role.dto'
import { Roles } from './guards/roles-auth.decorator'
import { RolesGuard } from './guards/roles.guard'
import { Role } from './models/roles.model'
import { RolesService } from './roles.service'

@ApiTags('Users')
@Controller('roles')
export class RolesController {
    constructor(private roleService: RolesService) {}

    //============================================================================================
    // ADMIN: CREATE NEW ROLE
    //============================================================================================
    @ApiOperation({
        summary: 'SUPERADMIN: CREATE NEW ROLE',
        description: 'Creates new role in database',
    })
    @ApiResponse({ status: 200, type: Role })
    @Roles('SUPERADMIN')
    @UseGuards(JwtGuard, RolesGuard)
    @Post()
    create(@Body() body: CreateRoleDto) {
        return this.roleService.createRole(body)
    }

    //============================================================================================
    // ADMIN: GET ROLE BY VALUE
    //============================================================================================
    @ApiOperation({
        summary: 'SUPERADMIN: GET ROLE BY VALUE',
        description: 'Geting a role from database by name',
    })
    @ApiResponse({ status: 200, type: Role })
    @Roles('SUPERADMIN')
    @UseGuards(JwtGuard, RolesGuard)
    @Get('/:value')
    getByValue(@Param() param: GetRoleDto) {
        return this.roleService.getRoleByValue(param.value)
    }

    //============================================================================================
    // ADMIN: GET ALL ROLES
    //============================================================================================
    @ApiOperation({
        summary: 'SUPERADMIN: GET ALL ROLES',
        description: 'Geting all roles from database',
    })
    @ApiResponse({ status: 200, type: [Role] })
    @Roles('SUPERADMIN')
    @UseGuards(JwtGuard, RolesGuard)
    @Get()
    getAllRoles() {
        return this.roleService.getAllRoles()
    }

    //============================================================================================
    // ADMIN: SET ROLE TO USER
    //============================================================================================
    @ApiOperation({
        summary: 'SUPERADMIN: SET ROLE TO USER',
        description: 'Sets new role to user',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN')
    @UseGuards(JwtGuard, RolesGuard)
    @Patch('set/:id')
    async setRole(@Param() param: IdDto, @Body() body: SetRoleDto) {
        const message = await this.roleService.setRole(param.id, body.role)
        return { message }
    }

    //============================================================================================
    // ADMIN: SET ROLE TO USER
    //============================================================================================
    @ApiOperation({
        summary: 'SUPERADMIN: UNSET ROLE FROM USER',
        description: 'Sets new role to user',
    })
    @ApiResponse({ status: 200, type: MessageDto })
    @Roles('SUPERADMIN')
    @UseGuards(JwtGuard, RolesGuard)
    @Patch('unset/:id')
    async unsetRole(@Param() param: IdDto, @Body() body: SetRoleDto) {
        const message = await this.roleService.setRole(param.id, body.role)
        return { message }
    }
}
