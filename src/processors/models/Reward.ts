import { sequelize as sequelizeInstance } from './db'
import { Model, DataTypes, BelongsToSetAssociationMixin } from 'sequelize'
import User from './User'
import Token from './Token'
import Wallet from './Wallet'

const config = {
    tableName: 'users_rewards',
    sequelize: sequelizeInstance,
}

class Reward extends Model {
    id!: string
    tokenBalance: string
    txDelta: string
    reflections: string
    totalFees: string
    jobId: string
    user: User
    setUser: BelongsToSetAssociationMixin<User, number>
    token: Token
    setToken: BelongsToSetAssociationMixin<Token, number>
    wallet: Wallet
    setWallet: BelongsToSetAssociationMixin<Wallet, number>
}

Reward.init(
    {
        id: {
            type: DataTypes.UUIDV4,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        tokenBalance: {
            type: DataTypes.STRING,
        },
        txDelta: {
            type: DataTypes.STRING,
        },
        reflections: {
            type: DataTypes.STRING,
        },
        totalFees: {
            type: DataTypes.STRING,
        },
        jobId: {
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
        token: {
            type: DataTypes.UUIDV4,
            field: 'tokenId',
            references: {
                model: 'Token',
                key: 'id',
            },
        },
        wallet: {
            type: DataTypes.UUIDV4,
            field: 'walletId',
            references: {
                model: 'Wallet',
                key: 'id',
            },
        },
    },
    config,
)

export default Reward
