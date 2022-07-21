import { ApiProperty } from '@nestjs/swagger'

export class RawTxDto {
    @ApiProperty({
        example: '0xf90163808080947a250d5630b4cf5397...',
        description: 'Signed transaction',
    })
    readonly tx: string

    @ApiProperty({
        example: '0xE7364390Bd0b1852235F99B379b21ca44331D286',
        description: 'User ethereum address',
    })
    readonly ethereumAddress: string
}
