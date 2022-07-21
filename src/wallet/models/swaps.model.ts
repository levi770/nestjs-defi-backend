import { ApiProperty } from '@nestjs/swagger'
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'
import { User } from 'src/users/models/users.model'

interface SwapCreationAttrs {
    status: string
    from: string
    to: string
    amount: number
    fee: number
    txData: object
}

@Table({ tableName: 'users_swaps' })
export class Swap extends Model<Swap, SwapCreationAttrs> {
    @ApiProperty()
    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    })
    id: number

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: true })
    status: string

    @ApiProperty()
    @Column({ type: DataType.STRING })
    token0: string

    @ApiProperty()
    @Column({ type: DataType.STRING })
    token1: string

    @ApiProperty()
    @Column({ type: DataType.DECIMAL })
    amount: number

    @ApiProperty()
    @Column({ type: DataType.STRING })
    address: string

    @ApiProperty()
    @Column({ type: DataType.DECIMAL })
    fee: number

    @ApiProperty()
    @Column({ type: DataType.JSON })
    txData: object

    @ApiProperty()
    @Column({ type: DataType.STRING })
    txId: string

    @ApiProperty()
    @Column({ type: DataType.JSON })
    tx: object

    @ApiProperty()
    @ForeignKey(() => User)
    userId: number

    @BelongsTo(() => User)
    user: User
}
