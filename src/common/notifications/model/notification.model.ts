import { ApiProperty } from '@nestjs/swagger'
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'
import { User } from 'src/users/models/users.model'

interface NotificationCreationAttrs {
    type: string
    message: object
}

@Table({ tableName: 'users_notifications' })
export class Notification extends Model<Notification, NotificationCreationAttrs> {
    @ApiProperty()
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string

    @ApiProperty()
    @Column({ type: DataType.STRING })
    type: string

    @ApiProperty()
    @Column({ type: DataType.JSON })
    message: object

    @ApiProperty()
    @ForeignKey(() => User)
    userId: string

    @BelongsTo(() => User)
    user: User
}
