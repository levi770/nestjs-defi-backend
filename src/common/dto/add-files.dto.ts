import { ApiProperty } from '@nestjs/swagger'

export class AddFilesDto {
    @ApiProperty({ format: 'binary' })
    files: string
}
