import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { UsersService } from 'src/users/users.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { Role } from './models/roles.model'
import { UserRoles } from './models/user-roles.model'

@Injectable()
export class RolesService {
    constructor(
        @InjectModel(Role) private roleRepository: typeof Role,
        @InjectModel(UserRoles) private userRolesRepository: typeof UserRoles,
        private userService: UsersService,
    ) {}

    async createRole(dto: CreateRoleDto) {
        try {
            return await this.roleRepository.create(dto)
        } catch (error) {
            throw new HttpException('Only enum roles available', HttpStatus.OK)
        }
    }

    async getSuperAdminRole() {
        let superRole = await this.getRoleByValue('SUPERADMIN')

        if (!superRole) {
            superRole = await this.createRole({
                value: 'SUPERADMIN',
                description: 'Super admin',
            })
        }

        const superAdminRole = await this.userRolesRepository.findOne({
            where: { roleId: superRole.id },
        })

        if (superAdminRole) return false

        return superRole
    }

    async getRoleByValue(value: string) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [role, created] = await this.roleRepository.findOrCreate({
                where: { value },
            })
            return role
        } catch (error) {
            throw new HttpException('Role not found', HttpStatus.OK)
        }
    }

    async getAllRoles() {
        return await this.roleRepository.findAll()
    }

    async setRole(id: string, value: string) {
        const user = await this.userService.getUserById(id)
        const role = await this.getRoleByValue(value)

        if (role && user) {
            await user.$add('user_roles', role.id)
            return `Role ${value} was set for user with id ${id}`
        }

        throw new HttpException('User or role not found', HttpStatus.OK)
    }

    async unsetRole(id: string, value: string) {
        try {
            const user = await this.userService.getUserById(id)
            const role = await this.getRoleByValue(value)

            if (role && user) {
                await user.$remove('user_roles', role.id)
                return `Role ${value} was removed for user with id ${id}`
            }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.OK)
        }
    }
}
