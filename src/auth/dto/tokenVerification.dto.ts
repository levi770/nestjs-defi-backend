import { ApiProperty } from '@nestjs/swagger'

export class TokenVerificationDto {
    @ApiProperty({
        example: 'exjdhys...',
        description: 'Google token for registration with Google',
    })
    token: string
}
