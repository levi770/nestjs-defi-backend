import { ApiProperty } from '@nestjs/swagger'
import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'
import { User } from 'src/users/models/users.model'
import { Role } from './roles.model'

@Table({ tableName: 'users_roles', createdAt: false, updatedAt: false })
export class UserRoles extends Model<UserRoles> {
    @ApiProperty()
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string

    @ApiProperty()
    @ForeignKey(() => Role)
    roleId: string

    @ApiProperty()
    @ForeignKey(() => User)
    userId: string
}
