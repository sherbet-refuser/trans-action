const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('StripeCharge', {
        stripeId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        user: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        }
    });
};
