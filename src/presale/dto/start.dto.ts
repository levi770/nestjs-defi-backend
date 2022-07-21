import { ApiProperty } from '@nestjs/swagger'

export class StartDto {
    @ApiProperty({ example: '1', description: 'Minimum investment in MATIC' })
    min: number

    @ApiProperty({ example: '10', description: 'Maximum investment in MATIC' })
    max: number

    @ApiProperty({ example: '100', description: 'Maximum total investment in MATIC' })
    total: number

    @ApiProperty({ example: '1000', description: 'Presale goal - hardcap in MATIC' })
    hardCap: number

    @ApiProperty({ example: '1000', description: 'Amount of CharityTokens per one MATIC' })
    tokensPerEth: number

    @ApiProperty({ example: '1', description: 'Presale contract withdrawals lock in weeks' })
    unlock: number

    @ApiProperty({ description: 'Presale description text' })
    info: string

    @ApiProperty({ description: 'Dev wallet address' })
    dev: string
}
