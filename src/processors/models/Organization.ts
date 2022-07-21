import { sequelize as sequelizeInstance } from './db'
import { Model, DataTypes } from 'sequelize'
import User from './User'
import { DataType } from 'sequelize-typescript'

const config = {
    tableName: 'organizations',
    sequelize: sequelizeInstance,
}

class Organization extends Model {
    id: string
    name: string
    number: string
    website: string
    description: string
    status: string
    approved: boolean
    address: string
    creationHash: string
    userId: string
    categoryId: string
    user: User
}

Organization.init(
    {
        id: {
            type: DataType.UUID,
            defaultValue: DataType.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
        },
        number: {
            type: DataTypes.STRING,
        },
        website: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.STRING,
        },
        approved: {
            type: DataTypes.BOOLEAN,
        },
        address: {
            type: DataTypes.STRING,
        },
        creationHash: {
            type: DataTypes.STRING,
        },
        userId: {
            type: DataTypes.STRING,
        },
        categoryId: {
            type: DataTypes.STRING,
        },
        user: {
            type: DataType.UUID,
            field: 'userId',
            references: {
                model: 'User',
                key: 'id',
            },
        },
    },
    config,
)

export default Organization
