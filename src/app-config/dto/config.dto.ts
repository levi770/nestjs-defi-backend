import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class ConfigDto {
    @ApiProperty({ required: false })
    @IsOptional()
    name?: string

    @ApiProperty({ required: false })
    @IsOptional()
    mode?: string

    @ApiProperty({ required: false })
    @IsOptional()
    factory?: string

    @ApiProperty({ required: false })
    @IsOptional()
    router?: string

    @ApiProperty({ required: false })
    @IsOptional()
    presale?: string

    @ApiProperty({ required: false })
    @IsOptional()
    locker?: string

    @ApiProperty({ required: false })
    @IsOptional()
    supportEmail?: string
}
