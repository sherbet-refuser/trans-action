module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');
  const BankBalance = sequelize.define('BankBalance', {
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
  });
  return BankBalance;
};
