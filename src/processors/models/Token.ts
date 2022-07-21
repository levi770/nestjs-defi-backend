import { sequelize as sequelizeInstance } from './db'
import { Model, DataTypes } from 'sequelize'

const config = {
    tableName: 'tokens_ext',
    sequelize: sequelizeInstance,
}

class Token extends Model {
    id!: string
    chainId: number
    contractAddress: string
    decimals: number
    symbol: string
    name: string
    rewards: boolean
    rewards_percent: number
    latest_usdc_price: number
    latest_matic_price: number
}

Token.init(
    {
        id: {
            type: DataTypes.UUIDV4,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        chainId: {
            type: DataTypes.STRING,
        },
        contractAddress: {
            type: DataTypes.STRING,
        },
        decimals: {
            type: DataTypes.INTEGER,
        },
        symbol: {
            type: DataTypes.STRING,
        },
        name: {
            type: DataTypes.STRING,
        },
        rewards: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        rewards_percent: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        latest_usdc_price: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        latest_matic_price: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
    },
    config,
)

export default Token
