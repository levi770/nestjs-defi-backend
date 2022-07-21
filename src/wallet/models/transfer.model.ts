import { ApiProperty } from '@nestjs/swagger'
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'
import { User } from 'src/users/models/users.model'

interface TransferCreationAttrs {
    type: string
    status: string
    from: string
    to: string
    token: string
    amount: number
    note?: string
    tx?: object
}

@Table({ tableName: 'users_transfers' })
export class Transfer extends Model<Transfer, TransferCreationAttrs> {
    @ApiProperty()
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: false })
    type: string

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'NEW' })
    status: string

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: false })
    from: string

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: false })
    to: string

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: false })
    token: string

    @ApiProperty()
    @Column({ type: DataType.DECIMAL, allowNull: false })
    amount: number

    @ApiProperty()
    @Column({ type: DataType.DECIMAL, allowNull: true })
    fee: number

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: true })
    note: string

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: true })
    txId: string

    @ApiProperty()
    @Column({ type: DataType.JSON, allowNull: true })
    tx: object

    @ApiProperty()
    @ForeignKey(() => User)
    userId: number

    @BelongsTo(() => User)
    user: User
}
