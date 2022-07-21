import { ApiProperty } from '@nestjs/swagger'

export class RateDto {
    @ApiProperty({ example: 'USD', description: 'From currency' })
    readonly currencyFrom: string

    @ApiProperty({ example: 'GDT', description: 'To currency' })
    readonly currencyTo: string

    @ApiProperty({ example: '100', description: 'Transaction amount' })
    readonly amount: number
}
