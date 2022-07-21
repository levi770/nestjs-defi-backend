import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'

export class TxSatatusIdDto {
    @ApiProperty()
    txId: string

    @ApiProperty({
        description: 'Type of transaction: swap, transfer, donate',
    })
    @IsEnum({
        swap: 'swap',
        transfer: 'transfer',
        donate: 'donate',
    })
    txType: string
}
