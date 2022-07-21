import { ApiProperty } from '@nestjs/swagger'

export class GetRoleDto {
    @ApiProperty({
        example: 'USER',
        description: 'Role name',
    })
    readonly value: string
}
