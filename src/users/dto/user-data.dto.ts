import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class UserDataDto {
    @ApiProperty({ required: false })
    @IsOptional()
    readonly firstname?: string

    @ApiProperty({ required: false })
    @IsOptional()
    readonly secondname?: string

    @ApiProperty({ required: false })
    @IsOptional()
    readonly lastname?: string

    @ApiProperty({ required: false })
    @IsOptional()
    readonly country?: string

    @ApiProperty({ required: false })
    @IsOptional()
    readonly city?: string

    @ApiProperty({ required: false })
    @IsOptional()
    readonly postalCode?: string

    @ApiProperty({ required: false })
    @IsOptional()
    readonly address?: string

    @ApiProperty({ required: false })
    @IsOptional()
    readonly phone?: string
}
