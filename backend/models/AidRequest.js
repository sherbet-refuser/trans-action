module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');
  const AidRequest = sequelize.define(
    'AidRequest',
    {
      name: { type: DataTypes.STRING, allowNull: false },
      isTrans: { type: DataTypes.STRING, allowNull: false },
      pronouns: { type: DataTypes.STRING, allowNull: false },
      amountRequested: { type: DataTypes.FLOAT, allowNull: false },
      category: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      neighborhood: { type: DataTypes.STRING, allowNull: false },
      socialMedia: { type: DataTypes.STRING, allowNull: true },
      contactMethod: { type: DataTypes.STRING, allowNull: false },
      contactInfo: { type: DataTypes.STRING, allowNull: false },
      receiveMethod: { type: DataTypes.STRING, allowNull: false },
      references: { type: DataTypes.TEXT, allowNull: true },
      state: { type: DataTypes.STRING, defaultValue: 'Submitted' },
      ip: { type: DataTypes.STRING, allowNull: false },
      requestReceivedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      freezeTableName: true,
      tableName: 'AidRequest' // force the exact table name to be used
    }
  );
  return AidRequest;
};
