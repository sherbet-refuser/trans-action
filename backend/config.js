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
        // daily at midnight (pacific)
        interval: '0 0 * * *',
        timezone: 'America/Los_Angeles'
    },
    discord: {
        botToken: process.env.DISCORD_BOT_TOKEN,
        aidRequestChannelId: process.env.DISCORD_AID_REVIEW_CHANNEL_ID,
        treasurerRoleId: process.env.DISCORD_TREASURER_ROLE_ID,
        majorityVote: parseInt(process.env.DISCORD_MAJORITY_VOTE, 10)
    },
    db: {
        dialect: 'sqlite',
        storage: './db/database.sqlite'
    }
};
