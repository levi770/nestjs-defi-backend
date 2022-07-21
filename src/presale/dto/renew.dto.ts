import { ApiProperty } from '@nestjs/swagger'

export class RenewDto {
    @ApiProperty({ example: '1', description: 'Deposit id' })
    _id: number

    @ApiProperty({ example: '1', description: 'New unlock timestamp in seconds' })
    _unlockTime: number
}
