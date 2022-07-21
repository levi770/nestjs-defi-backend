import { ApiProperty } from '@nestjs/swagger'
import { Column, DataType, Model, Table } from 'sequelize-typescript'

@Table({ tableName: 'app_config' })
export class AppConfig extends Model<AppConfig> {
    @ApiProperty()
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string

    @ApiProperty()
    @Column({ type: DataType.STRING })
    name: string

    @ApiProperty()
    @Column({ type: DataType.STRING })
    mode: string

    @ApiProperty()
    @Column({ type: DataType.STRING })
    factory: string

    @ApiProperty()
    @Column({ type: DataType.STRING })
    router: string

    @ApiProperty()
    @Column({ type: DataType.STRING })
    presale: string

    @ApiProperty()
    @Column({ type: DataType.STRING })
    locker: string

    @ApiProperty()
    @Column({ type: DataType.STRING })
    supportEmail: string
}
