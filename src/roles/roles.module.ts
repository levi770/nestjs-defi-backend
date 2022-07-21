import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from 'src/users/models/users.model'
import { RolesController } from './roles.controller'
import { Role } from './models/roles.model'
import { RolesService } from './roles.service'
import { UserRoles } from './models/user-roles.model'
import { UsersModule } from 'src/users/users.module'

@Module({
    controllers: [RolesController],
    providers: [RolesService],
    imports: [SequelizeModule.forFeature([Role, User, UserRoles]), UsersModule],
    exports: [RolesService],
})
export class RolesModule {}
