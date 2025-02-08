module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');
  const StripeBalance = sequelize.define(
    'StripeBalance',
    {
      pending: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );
  return StripeBalance;
};
