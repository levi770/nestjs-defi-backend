import { ApiProperty } from '@nestjs/swagger'

export class TwoFactorAuthenticationCodeDto {
    @ApiProperty()
    twoFactorAuthenticationCode: string
}
