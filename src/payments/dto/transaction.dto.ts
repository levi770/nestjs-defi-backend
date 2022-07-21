import { ApiProperty } from '@nestjs/swagger'

export class TransactionDto {
    @ApiProperty({
        example: 'eur, usd, rub, gbp, aud, sek, cad, chf, dkk, pln, czk, nok',
        description: 'From currency',
    })
    readonly cur_in: string

    @ApiProperty({ example: 'btc,eth, xrp, xlm, usd, euro, etc.', description: 'To currency' })
    readonly cur_out: string

    @ApiProperty({ example: '100', description: 'Transaction amount' })
    readonly amount_in: number

    @ApiProperty({
        example: '0xE7364390Bd0b1852235F99B379b21ca44331D286',
        description: 'User ethereum address',
    })
    readonly target_address: string
}
