import { ApiProperty } from '@nestjs/swagger'
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'
import { User } from 'src/users/models/users.model'

interface ContactCreationAttrs {
    address: string
    name?: string
}

@Table({ tableName: 'users_contacts' })
export class Contact extends Model<Contact, ContactCreationAttrs> {
    @ApiProperty()
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string

    @ApiProperty()
    @Column({ type: DataType.STRING, unique: true, allowNull: true })
    address: string

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: true })
    name: string

    @ApiProperty()
    @ForeignKey(() => User)
    userId: string

    @BelongsTo(() => User)
    user: User
}
