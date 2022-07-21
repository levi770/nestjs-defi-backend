import { ApiProperty } from '@nestjs/swagger'

export class CreateRoleDto {
    @ApiProperty({
        example: 'USER',
        description: 'Role name',
    })
    value: string

    @ApiProperty({
        example: 'Regular user',
        description: 'Role description',
    })
    description: string
}
