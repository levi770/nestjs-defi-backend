import { ApiProperty } from '@nestjs/swagger'

export class OneTokenDto {
    @ApiProperty({ example: '3', description: 'Token id', required: false })
    id: string
}
