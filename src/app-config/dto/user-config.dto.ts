import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class UserConfigDto {
    @ApiProperty({ required: false })
    @IsOptional()
    readonly language?: string

    @ApiProperty({ required: false })
    @IsOptional()
    readonly currency?: string

    @ApiProperty({ required: false })
    @IsOptional()
    readonly push_notifications?: boolean

    @ApiProperty({ required: false })
    @IsOptional()
    readonly email_notifications?: boolean

    @ApiProperty({ required: false })
    @IsOptional()
    readonly tokens?: object
}
