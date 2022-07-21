import { Sequelize } from 'sequelize'

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.POSTGRES_HOST,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    port: Number.parseInt(process.env.POSTGRES_PORT || '5432', 10),
    logging: false,
})

export { sequelize }
