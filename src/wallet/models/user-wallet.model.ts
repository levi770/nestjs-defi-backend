import { ApiProperty } from '@nestjs/swagger'
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'
import { User } from '../../users/models/users.model'

interface UserWalletCreationAttrs {
    address: string
    type: string
    label?: string
    keystore?: object
}

@Table({ tableName: 'users_wallets' })
export class UserWallet extends Model<UserWallet, UserWalletCreationAttrs> {
    @ApiProperty()
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: false })
    type: string

    @ApiProperty()
    @Column({ type: DataType.STRING })
    label: string

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: false })
    address: string

    @ApiProperty()
    @Column({ type: DataType.JSON })
    keystore: object

    @ApiProperty()
    @ForeignKey(() => User)
    userId: string

    @BelongsTo(() => User)
    user: User
}
