import { ApiProperty } from '@nestjs/swagger'

export class TxSatatusBodyDto {
    @ApiProperty()
    txHash: string
}
