import { ApiProperty } from '@nestjs/swagger'

export class DepositDto {
    @ApiProperty({ example: '2', description: 'Deposit id' })
    _id: number
}
