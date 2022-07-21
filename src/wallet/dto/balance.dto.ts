import { ApiProperty } from '@nestjs/swagger'

export class BalanceDto {
    @ApiProperty()
    eth: string

    @ApiProperty()
    tokens: object
}
