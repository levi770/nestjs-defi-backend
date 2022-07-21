import { ApiProperty } from '@nestjs/swagger'
import { IsEmail } from 'class-validator'

export class RecoveryDto {
    @ApiProperty({ example: 'email@mail.com', description: 'User email' })
    @IsEmail({}, { message: 'Incorrect email' })
    email: string
}
