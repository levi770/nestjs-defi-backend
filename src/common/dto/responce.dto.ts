import { ApiProperty } from '@nestjs/swagger'

export class ResponceDto {
    @ApiProperty()
    result: object
}
