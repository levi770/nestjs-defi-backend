import { ApiProperty } from '@nestjs/swagger'

export class DonationToAllDto {
    @ApiProperty({
        example: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
        description: 'User address',
    })
    from: string

    @ApiProperty({
        example: 'eth or ext',
        description: 'User address type, custody or external',
    })
    fromType: string

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
