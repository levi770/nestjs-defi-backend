import { sequelize as sequelizeInstance } from './db'
import { Model, DataTypes } from 'sequelize'
import Wallet from './Wallet'

const config = {
    tableName: 'users',
    sequelize: sequelizeInstance,
}

class User extends Model {
    id!: string
    email: string
    phone: string
    password: string
    status: string
    isRegisteredWithGoogle: boolean
    isTwoFactorAuthenticationEnabled: boolean
    isEmailConfirmed: boolean
    isPhoneNumberConfirmed: boolean
    meta: object
    user_wallets: Wallet
}

User.init(
    {
        id: {
            type: DataTypes.UUIDV4,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
        },
        phone: {
            type: DataTypes.STRING,
        },
        password: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.STRING,
        },
        isRegisteredWithGoogle: {
            type: DataTypes.BOOLEAN,
        },
        isTwoFactorAuthenticationEnabled: {
            type: DataTypes.BOOLEAN,
        },
        isEmailConfirmed: {
            type: DataTypes.BOOLEAN,
        },
        isPhoneNumberConfirmed: {
            type: DataTypes.BOOLEAN,
        },
        meta: {
            type: DataTypes.JSON,
        },
    },
    config,
)

export default User
