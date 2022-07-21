import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class PaginateDto {
    @ApiProperty({ required: false })
    @IsOptional()
    limit?: number

    @ApiProperty({ required: false })
    @IsOptional()
    page?: number
}
