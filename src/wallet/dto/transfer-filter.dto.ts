import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

export class TransferFilterDto {
    @ApiProperty({ description: 'Tx type filter: donation, transfer, all' })
    @IsEnum({
        transfer: 'transfer',
        donation: 'donation',
        all: 'all',
    })
    type: string

    @ApiProperty({ required: false })
    @IsOptional()
    to?: string

    @ApiProperty({ required: false })
    @IsOptional()
    token?: string

    @ApiProperty({ required: false })
    @IsOptional()
    status?: string

    @ApiProperty({ description: 'User Id. Only for ADMIN requests', required: false })
    @IsOptional()
    userId?: number

    @ApiProperty({ required: false })
    @IsOptional()
    limit?: number

    @ApiProperty({ required: false })
    @IsOptional()
    page?: number
}
