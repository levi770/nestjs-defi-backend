import { ApiProperty } from '@nestjs/swagger'

export class DeployDto {
    @ApiProperty({ description: 'Router address' })
    router: string

    @ApiProperty({ description: 'Dev wallet address' })
    dev: string
}
