import { ApiProperty } from '@nestjs/swagger'

export class LockManyDto {
    @ApiProperty({ description: 'LP token address' })
    _tokenAddress: string

    @ApiProperty({
        description: 'LP token amount to lock',
        type: 'array',
        items: { type: 'string' },
    })
    _amounts: string[]

    @ApiProperty({
        description: 'User address for withdraw tokens',
        type: 'array',
        items: { type: 'string' },
    })
    _withdrawalAddresses: string[]

    @ApiProperty({
        description: 'Unlock timestamp in seconds',
        type: 'array',
        items: { type: 'string' },
    })
    _unlockTimes: string[]
}
