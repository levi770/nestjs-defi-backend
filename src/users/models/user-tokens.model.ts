import { ApiProperty } from '@nestjs/swagger'
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'
import { User } from './users.model'

interface UserTokensCreationAttrs {
    verify_token?: string
    recovery_token?: string
    refresh_token?: string
    refresh_is_revoked?: boolean
    refresh_expires?: Date
}

@Table({ tableName: 'users_tokens' })
export class UserTokens extends Model<UserTokens, UserTokensCreationAttrs> {
    @ApiProperty({ example: '1', description: 'User data entity id' })
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string

    @ApiProperty({ example: 'CJSSKKF...', description: 'firebase_secret' })
    @Column({ type: DataType.STRING, allowNull: true })
    firebase_secret: string

    @ApiProperty({ example: 'CJSSKKF...', description: '2FA secret' })
    @Column({ type: DataType.STRING, allowNull: true })
    twoFactor_secret: string

    @ApiProperty({ example: 'CJSSKKF...', description: 'Refresh token for generate access tokens' })
    @Column({ type: DataType.STRING, allowNull: true })
    refresh_token: string

    @ApiProperty({ example: 'true', description: 'Is refresh token revoked or not' })
    @Column({ type: DataType.BOOLEAN, allowNull: true })
    refresh_is_revoked: boolean

    @ApiProperty({ example: '19/06/2022', description: 'Date of refresh token expiration' })
    @Column({ type: DataType.DATE, allowNull: true })
    refresh_expires: Date

    @ApiProperty({ example: '1', description: 'User id' })
    @ForeignKey(() => User)
    userId: string

    @BelongsTo(() => User)
    user: User
}
