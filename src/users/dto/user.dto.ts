import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, Length } from 'class-validator'

export class UserDto {
    @ApiProperty()
    fullname: string

    @ApiProperty()
    @IsEmail({}, { message: 'Incorrect email' })
    email: string

    @ApiProperty()
    @Length(4, 16, { message: 'Must bemore than 4 and less than 16' })
    password: string
}
