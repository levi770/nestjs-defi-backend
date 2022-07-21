import { ApiProperty } from '@nestjs/swagger'

export class ByWithdrawalDto {
    @ApiProperty()
    _withdrawalAddress: string
}
