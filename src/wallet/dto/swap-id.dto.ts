import { ApiProperty } from '@nestjs/swagger'

export class SwapIdDto {
    @ApiProperty()
    address: string

    @ApiProperty()
    swapId: string
}
