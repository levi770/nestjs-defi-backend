import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class ContactDto {
    @ApiProperty({
        example: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
        description: 'User address',
    })
    address: string

    @ApiProperty({
        example: 'Vasya',
        description: 'Contact name',
        required: false,
    })
    @IsOptional()
    name?: string
}
