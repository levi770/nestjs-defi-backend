import { ApiProperty } from '@nestjs/swagger'
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'
import { User } from './users.model'

interface UserDataCreationAttrs {
    firstname?: string
    secondname?: string
    lastname?: string
    country?: string
    city?: string
    postalCode?: string
    address?: string
    phone?: string
    userId: string
}

@Table({ tableName: 'users_data' })
export class UserData extends Model<UserData, UserDataCreationAttrs> {
    @ApiProperty({ example: '1', description: 'User id' })
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string

    @ApiProperty({ example: 'Ivan', description: `User's firstname` })
    @Column({ type: DataType.STRING })
    firstname: string

    @ApiProperty({ example: 'Ivanovich', description: `User's secondname` })
    @Column({ type: DataType.STRING })
    secondname: string

    @ApiProperty({ example: 'Ivanov', description: `User's lastname` })
    @Column({ type: DataType.STRING })
    lastname: string

    @ApiProperty({ example: 'Russia', description: `User's country` })
    @Column({ type: DataType.STRING })
    country: string

    @ApiProperty({ example: 'Moscow', description: `User's city` })
    @Column({ type: DataType.STRING })
    city: string

    @ApiProperty({ example: '050000', description: `User's postalCode` })
    @Column({ type: DataType.STRING })
    postalCode: string

    @ApiProperty({ example: 'pereulok Visheslavcev, 5 A', description: `User's address` })
    @Column({ type: DataType.STRING })
    address: string

    @ApiProperty({ example: '+79771234567', description: `User's phone` })
    @Column({ type: DataType.STRING })
    phone: string

    @ApiProperty()
    @ForeignKey(() => User)
    userId: string

    @BelongsTo(() => User)
    user: User
}
