import { sequelize as sequelizeInstance } from './db'
import { Model, DataTypes } from 'sequelize'
import User from './User'

const config = {
    tableName: 'users_swaps',
    sequelize: sequelizeInstance,
}

class Swap extends Model {
    id!: string
    status: string
    token0: string
    token1: string
    amount: string
    address: string
    fee: string
    txData: string
    txId: string
    tx: object
    userId: string
    user: User
}

Swap.init(
    {
        id: {
            type: DataTypes.UUIDV4,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        status: {
            type: DataTypes.STRING,
        },
        token0: {
            type: DataTypes.STRING,
        },
        token1: {
            type: DataTypes.STRING,
        },
        amount: {
            type: DataTypes.STRING,
        },
        address: {
            type: DataTypes.STRING,
        },
        fee: {
            type: DataTypes.STRING,
        },
        txData: {
            type: DataTypes.STRING,
        },
        txId: {
            type: DataTypes.STRING,
        },
        userId: {
            type: DataTypes.UUIDV4,
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

export default Swap
