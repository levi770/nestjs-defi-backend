import { sequelize as sequelizeInstance } from './db'
import { Model, DataTypes } from 'sequelize'
//import User from './User'

const config = {
    tableName: 'users_transfers',
    sequelize: sequelizeInstance,
}

class Transfer extends Model {
    id!: string
    status: string
    from: string
    to: string
    token: string
    amount: string
    fee: string
    note: string
    txId: string
    userId: string
}

Transfer.init(
    {
        id: {
            type: DataTypes.UUIDV4,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        status: {
            type: DataTypes.STRING,
        },
        from: {
            type: DataTypes.STRING,
        },
        to: {
            type: DataTypes.STRING,
        },
        token: {
            type: DataTypes.STRING,
        },
        amount: {
            type: DataTypes.STRING,
        },
        fee: {
            type: DataTypes.STRING,
        },
        note: {
            type: DataTypes.STRING,
        },
        txId: {
            type: DataTypes.STRING,
        },
        userId: {
            type: DataTypes.UUIDV4,
        },
    },
    config,
)

export default Transfer
