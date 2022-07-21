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
            email: {
                type: DataType.STRING,
                unique: true,
                allowNull: false,
            },
            phone: {
                type: DataType.STRING,
                unique: true,
                allowNull: true,
            },
            password: {
                type: DataType.STRING,
                allowNull: false,
            },
            status: {
                type: DataType.STRING,
                allowNull: true,
                defaultValue: 'NEW',
            },
            isRegisteredWithGoogle: {
                type: DataType.BOOLEAN,
                allowNull: true,
                defaultValue: false,
            },
            isTwoFactorAuthenticationEnabled: {
                type: DataType.BOOLEAN,
                allowNull: true,
                defaultValue: false,
            },
            isEmailConfirmed: {
                type: DataType.BOOLEAN,
                allowNull: true,
                defaultValue: false,
            },
            isPhoneNumberConfirmed: {
                type: DataType.BOOLEAN,
                allowNull: true,
                defaultValue: false,
            },
            meta: {
                type: DataType.JSON,
                allowNull: true,
            },
        })
    },

    down: async (queryInterface, Sequelize) => {
        return await queryInterface.dropTable('users')
    },
}
