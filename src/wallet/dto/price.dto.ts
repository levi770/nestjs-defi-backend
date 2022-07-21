import { ApiProperty } from '@nestjs/swagger'

export class PriceDto {
    @ApiProperty({
        example: 'ChaT',
    })
    readonly token0: string

    @ApiProperty({
        example: 'MATIC',
    })
    readonly token1: string
}
