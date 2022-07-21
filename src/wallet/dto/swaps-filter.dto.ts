import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class SwapsFilterDto {
    @ApiProperty({ example: 'USDC', description: 'From currency', required: false })
    @IsOptional()
    token0?: string

    @ApiProperty({ example: 'ChaT', description: 'To currency', required: false })
    @IsOptional()
    token1?: string

    @ApiProperty({ example: 'initial', description: 'Transaction status', required: false })
    @IsOptional()
    status?: string

    @ApiProperty({ example: '1', description: 'User Id. Only for ADMIN requests', required: false })
    @IsOptional()
    userId?: number

    @ApiProperty({
        example: '0x...',
        description: 'User address. Only for ADMIN requests',
        required: false,
    })
    @IsOptional()
    address?: string

    @ApiProperty({ required: false })
    @IsOptional()
    limit?: number

    @ApiProperty({ required: false })
    @IsOptional()
    page?: number
}
