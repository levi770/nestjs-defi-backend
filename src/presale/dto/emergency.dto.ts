import { ApiProperty } from '@nestjs/swagger'

export class EmergencyDto {
    @ApiProperty({ example: '2', description: 'Deposit id' })
    _id: number

    @ApiProperty({ description: 'Receiver address' })
    _receiver: string
}
