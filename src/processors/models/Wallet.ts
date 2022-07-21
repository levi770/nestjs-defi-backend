import { sequelize as sequelizeInstance } from './db'
import { Model, DataTypes } from 'sequelize'
import User from './User'

const config = {
    tableName: 'users_wallets',
    sequelize: sequelizeInstance,
}

class Wallet extends Model {
    id!: string
    address: string
    label: string
    user: User
    createdAt: Date
}

Wallet.init(
    {
        id: {
            type: DataTypes.UUIDV4,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        address: {
            type: DataTypes.STRING,
        },
        label: {
            type: DataTypes.STRING,
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

export default Wallet
