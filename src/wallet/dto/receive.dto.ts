import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class ReceiveDto {
    @ApiProperty({
        example: 'ChaT',
        description: 'Token symbol',
    })
    @IsString({ message: 'Must be string' })
    token: string

    @ApiProperty({
        example: '1',
        description: 'Transer amount',
    })
    @IsString({ message: 'Must be string' })
    amount: string
}
