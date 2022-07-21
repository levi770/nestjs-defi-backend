import { ApiProperty } from '@nestjs/swagger'

export class DeviceTokenDto {
    @ApiProperty()
    token: string
}
