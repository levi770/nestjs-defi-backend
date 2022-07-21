import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class LabelDto {
    @ApiProperty({
        example: 'Main',
        description: 'Wallet label',
        required: false,
    })
    @IsOptional()
    label?: string
}
