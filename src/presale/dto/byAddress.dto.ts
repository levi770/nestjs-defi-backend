import { ApiProperty } from '@nestjs/swagger'

export class ByAddressDto {
    @ApiProperty()
    _tokenAddress: string

    @ApiProperty()
    _walletAddress: string
}
