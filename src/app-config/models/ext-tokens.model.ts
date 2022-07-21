import { ApiProperty } from '@nestjs/swagger'
import { Column, DataType, Model, Table } from 'sequelize-typescript'

interface ExtTokenCreationAttrs {
    chainId: number
    contractAddress: string
    decimals: number
    symbol: string
    name: string
    rewards: boolean
}

@Table({ tableName: 'tokens_ext' })
export class ExtToken extends Model<ExtToken, ExtTokenCreationAttrs> {
    @ApiProperty()
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string

    @ApiProperty()
    @Column({ type: DataType.INTEGER })
    chainId: number

    @ApiProperty()
    @Column({ type: DataType.STRING })
    contractAddress: string

    @ApiProperty()
    @Column({ type: DataType.INTEGER })
    decimals: number

    @ApiProperty()
    @Column({ type: DataType.STRING })
    symbol: string

    @ApiProperty()
    @Column({ type: DataType.STRING })
    name: string

    @ApiProperty()
    @Column({ type: DataType.STRING })
    logo: string

    @ApiProperty()
    @Column({ type: DataType.BOOLEAN })
    rewards: boolean

    @ApiProperty()
    @Column({ type: DataType.INTEGER })
    rewards_percent: number

    @ApiProperty()
    @Column({ type: DataType.DECIMAL })
    latest_usdc_price: number

    @ApiProperty()
    @Column({ type: DataType.DECIMAL })
    latest_matic_price: number
}
