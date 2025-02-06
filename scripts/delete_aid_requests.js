#!/usr/bin/env node

(async () => {
    const { sequelize, AidRequest } = require('../backend/db');

    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        await sequelize.sync(); // ...ensures tables are created...

        // Delete all aid requests
        const deleted = await AidRequest.destroy({ where: {} });
        console.log(`Deleted ${deleted} aid requests.`);
    } catch (error) {
        console.error('Error deleting aid requests:', error);
    } finally {
        await sequelize.close();
    }
})();
