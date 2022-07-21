import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'

export class RewardsQueryDto {
    @ApiProperty({
        description: 'Period for values: all, day, week, month, quarter, half, year',
    })
    @IsEnum({
        day: 'day',
        week: 'week',
        month: 'month',
        quarter: 'quarter',
        half: 'half',
        year: 'year',
        all: 'all',
    })
    period: string
}
