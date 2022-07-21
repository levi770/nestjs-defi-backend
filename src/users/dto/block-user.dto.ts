import { ApiProperty } from '@nestjs/swagger'

export class BlockUserDto {
    @ApiProperty({ example: 'Huligan', description: 'Blocking reason' })
    reason: string
}
