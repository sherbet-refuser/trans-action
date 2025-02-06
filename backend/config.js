module.exports = {
    port: process.env.BACKEND_PORT,
    env: process.env.NODE_ENV,
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        updatesEnabled: process.env.STRIPE_UPDATES_ENABLED === 'true'
    },
    plaid: {
        clientID: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        env: process.env.PLAID_ENV,
        accessToken: process.env.PLAID_ACCESS_TOKEN,
        updatesEnabled: process.env.PLAID_UPDATES_ENABLED === 'true'
    },
    bankApi: {
        cutoff: '2025-01-15'
    },
    scheduler: {
        interval: '0 0 * * *' // updated to run once a day at midnight
    },
    db: {
        dialect: 'sqlite',
        storage: './db/database.sqlite'
    }
};
