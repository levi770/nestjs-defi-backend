import { ApiProperty } from '@nestjs/swagger'
import { MinLength } from 'class-validator'

export class UserPasswordDto {
    @ApiProperty({ example: '12345678', description: 'User password' })
    @MinLength(7, { message: 'Must be more than 7 symbols' })
    password: string
}
