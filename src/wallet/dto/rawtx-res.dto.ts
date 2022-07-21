import { ApiProperty } from '@nestjs/swagger'

export class RawTxResDto {
    @ApiProperty()
    nonce: string

    @ApiProperty()
    to: string

    @ApiProperty()
    chainId: string

    @ApiProperty()
    gasPrice: string

    @ApiProperty()
    gas: string

    @ApiProperty()
    value: string

    @ApiProperty()
    data: Buffer
}
