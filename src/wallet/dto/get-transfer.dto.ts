import { ApiProperty } from '@nestjs/swagger'

export class GetTransferDto {
    @ApiProperty()
    address: string

    @ApiProperty()
    txId: string
}
