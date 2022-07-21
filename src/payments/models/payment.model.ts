import { ApiProperty } from '@nestjs/swagger'
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'
import { User } from 'src/users/models/users.model'
import { UserWallet } from 'src/wallet/models/user-wallet.model'

interface PaymentCreationAttrs {
    transactionId: number
    status: string
    curIn: string
    curOut: string
    amountIn: number
}

@Table({ tableName: 'users_payments' })
export class Payment extends Model<Payment, PaymentCreationAttrs> {
    @ApiProperty()
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string

    @ApiProperty()
    @Column({ type: DataType.INTEGER })
    transactionId: number

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: true })
    status: string

    @ApiProperty()
    @Column({ type: DataType.DATE, allowNull: true })
    confirmedAt: Date

    @ApiProperty()
    @Column({ type: DataType.DATE, allowNull: true })
    finishedAt: Date

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: true })
    blockchainHash: string

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: true })
    curIn: string

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: true })
    curOut: string

    @ApiProperty()
    @Column({ type: DataType.DECIMAL, allowNull: true })
    amountIn: number

    @ApiProperty()
    @Column({ type: DataType.DECIMAL, allowNull: true })
    amountOut: number

    @ApiProperty()
    @Column({ type: DataType.DECIMAL, allowNull: true })
    realAmountOut: number

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: true })
    reason: string

    @ApiProperty()
    @Column({ type: DataType.JSON, allowNull: true })
    extra_info: object

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: true })
    couponCode: string

    @ApiProperty()
    @ForeignKey(() => UserWallet)
    targetAddress: string

    @BelongsTo(() => UserWallet)
    user_wallet: UserWallet

    @ApiProperty()
    @ForeignKey(() => User)
    userId: string

    @BelongsTo(() => User)
    user: User
}
