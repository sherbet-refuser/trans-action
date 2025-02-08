const { Sequelize } = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize({
  dialect: config.db.dialect,
  storage: config.db.storage,
  logging: false,
});

// load models
const BankBalance = require('./models/BankBalance')(sequelize);
const BankWithdrawal = require('./models/BankWithdrawal')(sequelize);
const StripeCharge = require('./models/StripeCharge')(sequelize);
const StripeUser = require('./models/StripeUser')(sequelize);
const StripeBalance = require('./models/StripeBalance')(sequelize);
const SyncStatus = require('./models/SyncStatus')(sequelize);
const AidRequest = require('./models/AidRequest')(sequelize);

module.exports = {
  sequelize,
  BankBalance,
  BankWithdrawal,
  StripeCharge,
  StripeUser,
  StripeBalance,
  SyncStatus,
  AidRequest,
};
