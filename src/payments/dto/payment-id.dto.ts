import { ApiProperty } from '@nestjs/swagger'

export class PaymentIdDto {
    @ApiProperty()
    readonly id: string
}
