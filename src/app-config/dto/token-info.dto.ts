import { ApiProperty } from '@nestjs/swagger'

export class TokenInfoDto {
    @ApiProperty({
        example: 'BTC,ETH,USDT',
        description: 'Token symbol. One or coma separated many',
    })
    readonly symbol: string
}
