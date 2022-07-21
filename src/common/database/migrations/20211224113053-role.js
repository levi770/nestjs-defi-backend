'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.createTable('Users', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                unique: true,
                primaryKey: true,
            },
            value: {
                type: DataType.STRING,
                unique: true,
                allowNull: false,
            },
            description: {
                type: DataType.STRING,
                allowNull: true,
            },
        })
    },

    down: async (queryInterface, Sequelize) => {
        return await queryInterface.dropTable('roles')
    },
}
