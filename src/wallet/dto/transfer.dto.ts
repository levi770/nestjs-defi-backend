import { ApiProperty } from '@nestjs/swagger'

export class TransferDto {
    @ApiProperty({
        example: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
        description: 'Contact address',
    })
    to: string

    @ApiProperty({
        example: 'MATIC',
        description: 'Token symbol',
    })
    token: string

    @ApiProperty({
        example: '1',
        description: 'Transer amount',
    })
    amount: string

    @ApiProperty({
        required: false,
    })
    note?: string
}
