import { ApiProperty } from '@nestjs/swagger'

export class SpecificDto {
    @ApiProperty({ description: 'Token address' })
    token: number

    @ApiProperty({ description: 'Receiver address' })
    receiver: string

    @ApiProperty({ description: 'Deposit amount' })
    amount: string
}
