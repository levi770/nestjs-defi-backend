import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class PaymentsFilterDto {
    @ApiProperty({ example: 'usd', description: 'From currency', required: false })
    @IsOptional()
    readonly curIn?: string

    @ApiProperty({ example: 'gdt', description: 'To currency', required: false })
    @IsOptional()
    readonly curOut?: string

    @ApiProperty({ example: 'initial', description: 'Transaction status', required: false })
    @IsOptional()
    readonly status?: string

    @ApiProperty({ example: '1', description: 'User Id. Only for ADMIN requests', required: false })
    @IsOptional()
    readonly userId?: number

    @ApiProperty({
        example: '0xE7364390Bd0b1852235F99B379b21ca44331D286',
        description: 'User ethereum address. Only for ADMIN requests',
        required: false,
    })
    @IsOptional()
    targetAddress?: string

    @ApiProperty({ required: false })
    @IsOptional()
    page?: number

    @ApiProperty({ required: false })
    @IsOptional()
    limit?: number
}
