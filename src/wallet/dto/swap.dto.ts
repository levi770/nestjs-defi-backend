import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class SwapTokensDto {
    @ApiProperty({
        example: 'WMATIC',
        description: 'From contract address',
    })
    token0: string

    @ApiProperty({
        example: 'ChaT',
        description: 'To contract address',
    })
    token1: string

    @ApiProperty({
        example: '1',
        description: 'Ammount of tokens to swap',
    })
    amount: number

    @ApiProperty({
        example: '1',
        description: 'Slippage percent',
        required: false,
    })
    @IsOptional()
    slippage?: number

    @ApiProperty({
        example: '20',
        description: 'Order deadline in minutes',
    })
    deadline: number
}
