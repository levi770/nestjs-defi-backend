import { ApiProperty } from '@nestjs/swagger'

export class SetRoleDto {
    @ApiProperty({ example: 'USER', description: 'Regular user' })
    readonly role: string
}
