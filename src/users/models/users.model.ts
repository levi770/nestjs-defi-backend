import { ApiProperty } from '@nestjs/swagger'
import { BelongsToMany, Column, DataType, HasMany, HasOne, Model, Table } from 'sequelize-typescript'
import { Contact } from 'src/wallet/models/contacts.model'
import { Role } from 'src/roles/models/roles.model'
import { UserRoles } from 'src/roles/models/user-roles.model'
import { UserData } from './user-data.model'
import { UserTokens } from './user-tokens.model'
import { UserWallet } from '../../wallet/models/user-wallet.model'
import { Organization } from 'src/organizations/models/organization.model'
import { Transfer } from 'src/wallet/models/transfer.model'
import { Swap } from 'src/wallet/models/swaps.model'
import { Payment } from 'src/payments/models/payment.model'
import { UserConfig } from 'src/app-config/models/user-config.model'

interface UserCreationAttrs {
    fullname?: string
    email: string
    password?: string
    phone?: string
    isRegisteredWithGoogle?: boolean
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreationAttrs> {
    @ApiProperty()
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string

    @ApiProperty()
    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    email: string

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: true })
    fullname: string

    @ApiProperty()
    @Column({ type: DataType.STRING, unique: true, allowNull: true })
    phone: string

    @Column({ type: DataType.STRING, allowNull: false })
    password: string

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: true, defaultValue: 'NEW' })
    status: string

    @Column({ type: DataType.BOOLEAN, allowNull: true, defaultValue: false })
    isRegisteredWithGoogle: boolean

    @Column({ type: DataType.BOOLEAN, allowNull: true, defaultValue: false })
    isTwoFactorAuthenticationEnabled: boolean

    @Column({ type: DataType.BOOLEAN, allowNull: true, defaultValue: false })
    isEmailConfirmed: boolean

    @Column({ type: DataType.BOOLEAN, allowNull: true, defaultValue: false })
    isPhoneNumberConfirmed: boolean

    @Column({ type: DataType.BOOLEAN, allowNull: true, defaultValue: false })
    isPasswordReseting: boolean

    @ApiProperty()
    @Column({ type: DataType.JSON, allowNull: true })
    meta: object

    @BelongsToMany(() => Role, () => UserRoles)
    user_roles: Role[]

    @HasOne(() => UserData, { onDelete: 'CASCADE' })
    user_data: UserData

    @HasOne(() => UserTokens, { onDelete: 'CASCADE' })
    user_tokens: UserTokens

    @HasMany(() => UserWallet, { onDelete: 'CASCADE' })
    user_wallets: UserWallet[]

    @HasMany(() => Contact, { onDelete: 'CASCADE' })
    user_contacts: Contact[]

    @HasMany(() => Organization, { onDelete: 'CASCADE' })
    user_organizations: Organization[]

    @HasMany(() => Transfer, { onDelete: 'CASCADE' })
    user_transfers: Transfer[]

    @HasMany(() => Swap, { onDelete: 'CASCADE' })
    user_swaps: Swap[]

    @HasMany(() => Payment, { onDelete: 'CASCADE' })
    user_payments: Payment[]

    @HasOne(() => UserConfig, { onDelete: 'CASCADE' })
    user_config: UserConfig
}
