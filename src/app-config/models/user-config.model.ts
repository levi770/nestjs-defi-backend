import { ApiProperty } from '@nestjs/swagger'
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'
import { User } from 'src/users/models/users.model'

interface UserConfigCreationAttrs {
    language: string
    currency: string
    notifications: boolean
}

@Table({ tableName: 'users_config' })
export class UserConfig extends Model<UserConfig, UserConfigCreationAttrs> {
    @ApiProperty()
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: true })
    language: string

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: true })
    currency: string

    @ApiProperty()
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    push_notifications: boolean

    @ApiProperty()
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    email_notifications: boolean

    @ApiProperty()
    @Column({ type: DataType.JSON })
    tokens: object

    @ApiProperty()
    @ForeignKey(() => User)
    userId: string

    @BelongsTo(() => User)
    user: User
}
