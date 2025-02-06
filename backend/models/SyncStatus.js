module.exports = (sequelize) => {
    const { DataTypes } = require('sequelize');
    const SyncStatus = sequelize.define('SyncStatus', {
        lastSynced: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        plaidCursor: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        }
    }, {
        timestamps: false
    });
    return SyncStatus;
};
