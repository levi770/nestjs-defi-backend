import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class LockOneDto {
    @ApiProperty({ description: 'LP token address' })
    @IsString({ message: 'must be string' })
    _tokenAddress: string

    @ApiProperty({ example: '1', description: 'LP token amount to lock' })
    @IsString({ message: 'must be string' })
    _amount: string

    @ApiProperty({ description: 'User address for withdraw tokens' })
    @IsString({ message: 'must be string' })
    _withdrawalAddress: string

    @ApiProperty({ example: '1652975071', description: 'Unlock timestamp in seconds' })
    @IsString({ message: 'must be string' })
    _unlockTime: string
}
