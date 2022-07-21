import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, MinLength } from 'class-validator'

export class RegisterDto {
    @ApiProperty({ example: 'John', description: 'User fullname' })
    fullname: string

    @ApiProperty({ example: '20', description: 'User age' })
    age: string

    @ApiProperty({ example: 'email@mail.com', description: 'User email' })
    @IsEmail({}, { message: 'Incorrect email' })
    email: string

    @ApiProperty({ example: '12345678', description: 'User password' })
    @MinLength(8, { message: 'Must be 8 or more symbols' })
    password: string
}
