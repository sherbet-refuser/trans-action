const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    return sequelize.define('StripeUser', {
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
};
