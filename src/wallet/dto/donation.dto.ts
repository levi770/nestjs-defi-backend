import { ApiProperty } from '@nestjs/swagger'

export class DonationDto {
    @ApiProperty({
        example: 'all',
        description: 'Organization id or keyword "all"',
    })
    to: string

    @ApiProperty({
        example: 'MATIC or ChaT',
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
