import { ApiProperty } from '@nestjs/swagger'

export class UserAddressDto {
    @ApiProperty({
        example: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
        description: 'User address',
    })
    address: string
}
