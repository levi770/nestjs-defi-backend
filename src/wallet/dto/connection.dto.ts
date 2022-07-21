import { ApiProperty } from '@nestjs/swagger'

export class ConnectionDto {
    @ApiProperty()
    hostUrl: string

    @ApiProperty()
    chainId: number
}
