#!/usr/bin/env node

(async () => {
  const { sequelize, SyncStatus } = require('../backend/db');

  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync();

    // Delete all sync status entries
    const deleted = await SyncStatus.destroy({ where: {} });
    console.log(`Deleted ${deleted} sync status entries.`);
  } catch (error) {
    console.error('Error deleting sync status entries:', error);
  } finally {
    await sequelize.close();
  }
})();
