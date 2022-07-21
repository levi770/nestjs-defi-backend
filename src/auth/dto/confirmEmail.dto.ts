import { ApiProperty } from '@nestjs/swagger'

export class ConfirmEmailDto {
    @ApiProperty({ example: 'exjdhys...', description: 'User access token for email confirmation' })
    token: string
}
