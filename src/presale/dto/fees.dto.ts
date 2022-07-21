import { ApiProperty } from '@nestjs/swagger'

export class FeesDto {
    @ApiProperty({ example: '2', description: 'CharityToken reflection fee' })
    taxFee: number

    @ApiProperty({ example: '1', description: 'CharityToken charity fee' })
    charityFee: number
}
