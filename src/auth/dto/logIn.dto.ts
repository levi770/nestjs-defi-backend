import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, MinLength } from 'class-validator'

export class LogInDto {
    @ApiProperty({ example: 'email@mail.com', description: 'User email' })
    @IsEmail({}, { message: 'Incorrect email' })
    email: string

    @ApiProperty({ example: '12345678', description: 'User password' })
    @MinLength(8, { message: 'Must bemore than 8 symbols' })
    password: string
}
