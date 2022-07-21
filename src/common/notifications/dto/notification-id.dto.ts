import { ApiProperty } from '@nestjs/swagger'

export class NotificationIdDto {
    @ApiProperty()
    notificationId: string
}
