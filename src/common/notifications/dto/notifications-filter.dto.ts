import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class NotificationsFilterDto {
    @ApiProperty({ example: 'push, email' })
    @IsOptional()
    type?: string

    @ApiProperty({ required: false })
    @IsOptional()
    limit?: number

    @ApiProperty({ required: false })
    @IsOptional()
    page?: number
}
