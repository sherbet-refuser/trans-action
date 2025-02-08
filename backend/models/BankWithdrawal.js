const { DataTypes } = require('sequelize');
const BankWithdrawal = (sequelize) =>
  sequelize.define('BankWithdrawal', {
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    plaidId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  });
module.exports = BankWithdrawal;
