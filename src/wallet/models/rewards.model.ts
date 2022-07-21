import { ApiProperty } from '@nestjs/swagger'
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'
import { ExtToken } from 'src/app-config/models/ext-tokens.model'
import { User } from 'src/users/models/users.model'
import { UserWallet } from './user-wallet.model'

interface RewardCreationAttrs {
    reflections: number
    txDelta: number
    tokenBalance: number
    //totalFees: number
    jobId: string
}

@Table({ tableName: 'users_rewards' })
export class Reward extends Model<Reward, RewardCreationAttrs> {
    @ApiProperty()
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string

    @ApiProperty()
    @Column({ type: DataType.DECIMAL, allowNull: true })
    reflections: number

    @ApiProperty()
    @Column({ type: DataType.DECIMAL, allowNull: true })
    txDelta: number

    @ApiProperty()
    @Column({ type: DataType.DECIMAL, allowNull: true })
    tokenBalance: number

    @ApiProperty()
    @Column({ type: DataType.DECIMAL, allowNull: true })
    totalFees: number

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: true })
    jobId: string

    @ApiProperty()
    @ForeignKey(() => User)
    userId: number

    @BelongsTo(() => User)
    user: User

    @ApiProperty()
    @ForeignKey(() => ExtToken)
    tokenId: number

    @BelongsTo(() => ExtToken)
    token: ExtToken

    @ApiProperty()
    @ForeignKey(() => UserWallet)
    walletId: number

    @BelongsTo(() => UserWallet)
    wallet: UserWallet
}
