import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class AllTokensFilterDto {
    @ApiProperty({ example: '56', description: 'Chain id', required: false })
    @IsOptional()
    chainId?: number

    @ApiProperty({ required: false })
    @IsOptional()
    limit?: number

    @ApiProperty({ required: false })
    @IsOptional()
    page?: number
}
