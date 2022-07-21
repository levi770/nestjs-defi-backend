import { ApiProperty } from '@nestjs/swagger'

export class AddressDto {
    @ApiProperty({
        example: '0xE7364390Bd0b1852235F99B379b21ca44331D286',
        description: 'User ethereum address',
    })
    address: string
}
