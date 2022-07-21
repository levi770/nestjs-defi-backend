import { sequelize as sequelizeInstance } from './db'
import { Model, DataTypes } from 'sequelize'
import User from './User'

const config = {
    tableName: 'users_tokens',
    sequelize: sequelizeInstance,
}

class UserToken extends Model {
    id!: string
    firebase_secret: string
    twoFactor_secret: string
    refresh_token: string
    refresh_is_revoked: boolean
    refresh_expires: Date
    user: User
}

UserToken.init(
    {
        id: {
            type: DataTypes.UUIDV4,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        firebase_secret: {
            type: DataTypes.STRING,
        },
        twoFactor_secret: {
            type: DataTypes.STRING,
        },
        refresh_token: {
            type: DataTypes.STRING,
        },
        refresh_is_revoked: {
            type: DataTypes.BOOLEAN,
        },
        refresh_expires: {
            type: DataTypes.DATE,
        },
        user: {
            type: DataTypes.UUIDV4,
            field: 'userId',
            references: {
                model: 'User',
                key: 'id',
            },
        },
    },
    config,
)

export default UserToken
