import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class TokenDto {
    @ApiProperty({ example: '3', description: 'Network id', required: false })
    @IsOptional()
    chainId?: number

    @ApiProperty({
        example: '0x517122f650d34fe34a570e3fbd6d4c0d39113309',
        description: 'Contract address',
        required: false,
    })
    @IsOptional()
    contractAddress?: string

    @ApiProperty({ example: '18', description: 'Token decimals', required: false })
    @IsOptional()
    decimals?: number

    @ApiProperty({ example: 'WBNB', description: 'Token symbol', required: false })
    @IsOptional()
    symbol?: string

    @ApiProperty({ example: 'Wrapped Binance token', description: 'Token name', required: false })
    @IsOptional()
    name?: string

    @ApiProperty({ example: 'true', description: 'Rewards enabled?', required: false })
    @IsOptional()
    rewards?: boolean
}
