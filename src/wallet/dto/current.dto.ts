import { ApiProperty } from '@nestjs/swagger'

export class CurrentDto {
    @ApiProperty({
        example: 'ChaT',
        description: 'Base currency address',
    })
    token0: string

    @ApiProperty({
        example: 'USDT',
        description: 'Quote currency address',
    })
    token1: string
}
