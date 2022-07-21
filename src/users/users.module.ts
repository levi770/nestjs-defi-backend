import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Role } from 'src/roles/models/roles.model'
import { UserRoles } from 'src/roles/models/user-roles.model'
import { UserData } from './models/user-data.model'
import { UserTokens } from './models/user-tokens.model'
import { UsersController } from './users.controller'
import { User } from './models/users.model'
import { UsersService } from './users.service'
import { NotificationsModule } from 'src/common/notifications/notifications.module'

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    imports: [SequelizeModule.forFeature([User, Role, UserRoles, UserData, UserTokens]), NotificationsModule],
    exports: [UsersService],
})
export class UsersModule {}
