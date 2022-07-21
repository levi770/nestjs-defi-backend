import { ApiProperty } from '@nestjs/swagger'

export class SearchUserDto {
    @ApiProperty({ example: 'email@mail.com', description: 'Search value' })
    readonly value: string
}
