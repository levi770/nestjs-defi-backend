import { ApiProperty } from '@nestjs/swagger'

export class ByTokenDto {
    @ApiProperty()
    _tokenAddress: string
}
