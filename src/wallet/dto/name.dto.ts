import { ApiProperty } from '@nestjs/swagger'

export class NameDto {
    @ApiProperty({
        example: 'Vasya',
        description: 'Contact name',
        required: false,
    })
    name: string
}
