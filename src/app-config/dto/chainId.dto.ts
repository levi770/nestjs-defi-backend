import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class ChainIdDto {
    @ApiProperty({ example: '56', description: 'Chain id', required: false })
    @IsOptional()
    readonly chainId?: number
}
