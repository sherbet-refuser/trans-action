const cron = require('node-cron');
const config = require('./config');
const { BankBalance, BankWithdrawal, StripeCharge, StripeUser, StripeBalance, SyncStatus } = require('./db');
const stripe = require('stripe')(config.stripe.secretKey);
const plaid = require('plaid');

async function fetchBankData() {
    const { Configuration, PlaidApi, PlaidEnvironments } = plaid;
    const configuration = new Configuration({
        basePath: PlaidEnvironments[config.plaid.env],
        baseOptions: {
            headers: {
                'PLAID-CLIENT-ID': config.plaid.clientID,
                'PLAID-SECRET': config.plaid.secret
            }
        }
    });
    const client = new PlaidApi(configuration);

    const cutoffDate = new Date(config.bankApi.cutoff);

    let syncRecord = await SyncStatus.findOne();
    let cursor = (syncRecord && syncRecord.plaidCursor) || '';

    try {
        const syncResponse = (await client.transactionsSync({
            access_token: config.plaid.accessToken,
            cursor: cursor,
        })).data;
        if (syncResponse.accounts && syncResponse.accounts.length > 0) {
            const accountBalance = syncResponse.accounts[0].balances.current;
            let balanceRecord = await BankBalance.findOne();
            if (!balanceRecord) {
                await BankBalance.create({ amount: accountBalance });
                console.log('New bank balance recorded:', accountBalance);
            } else {
                balanceRecord.amount = accountBalance;
                await balanceRecord.save();
                console.log('Bank balance updated:', accountBalance);
            }
        }
        const processTransaction = async (tx) => {
            const txDate = new Date(tx.date);
            if (tx.amount < 0 || txDate < cutoffDate) return;
            const existing = await BankWithdrawal.findOne({ where: { plaidId: tx.transaction_id } });
            const data = {
                plaidId: tx.transaction_id,
                amount: tx.amount,
                timestamp: new Date(tx.date)
            };
            if (existing) {
                Object.assign(existing, data);
                await existing.save();
                console.log('Modified transaction processed:', tx.transaction_id);
            } else {
                await BankWithdrawal.create(data);
                console.log('New transaction processed:', tx.transaction_id);
            }
        };
        for (const tx of syncResponse.added || []) {
            await processTransaction(tx);
        }
        for (const tx of syncResponse.modified || []) {
            await processTransaction(tx);
        }
        for (const tx of syncResponse.removed || []) {
            const existing = await BankWithdrawal.findOne({ where: { plaidId: tx.transaction_id } });
            if (existing) {
                await existing.destroy();
                console.log('Removed transaction processed:', tx.transaction_id);
            }
        }
        cursor = syncResponse.next_cursor || '';
        if (syncRecord) {
            syncRecord.plaidCursor = cursor;
            await syncRecord.save();
        } else {
            await SyncStatus.create({ lastSynced: new Date(), plaidCursor: cursor });
            syncRecord = await SyncStatus.findOne();
        }
        console.log('Plaid withdrawals synced successfully.');
    } catch (err) {
        if (err.response && err.response.data) {
            console.error('Error syncing Plaid transactions:', err.response.data);
        } else {
            console.error('Error syncing Plaid transactions:', err.message);
        }
    }
}

async function fetchStripeCharges() {
    try {
        const chargesResponse = await stripe.charges.list({ limit: 100 });
        return chargesResponse.data;
    } catch (err) {
        console.error('Error fetching stripe charges:', err);
        return [];
    }
}

async function getAnonymizedUserId(email) {
    let mapping = await StripeUser.findOne({ where: { email } });
    if (mapping) return mapping.userId;
    const maxUserId = await StripeUser.max('userId');
    const newId = (maxUserId || 0) + 1;
    mapping = await StripeUser.create({ email, userId: newId });
    return mapping.userId;
}

async function processBankData() {
    await fetchBankData();
    console.log('Bank data processed successfully.');
}

async function fetchStripeBalance() {
    try {
        return await stripe.balance.retrieve();
    } catch (err) {
        console.error('Error fetching stripe balance:', err);
        return null;
    }
}

async function processStripeCharges() {
    const charges = await fetchStripeCharges();
    for (const charge of charges) {
        const existing = await StripeCharge.findOne({ where: { stripeId: charge.id } });
        if (!existing) {
            const email = charge.billing_details.email || 'anon';
            const anonymizedId = await getAnonymizedUserId(email);
            await StripeCharge.create({
                stripeId: charge.id,
                user: anonymizedId,
                amount: charge.amount,
                date: new Date(charge.created * 1000)
            });
        }
    }
    console.log('Stripe charges processed successfully.');
}

async function processStripeBalance() {
    const balance = await fetchStripeBalance();
    if (!balance) return;
    let record = await StripeBalance.findOne();
    if (!record) {
        await StripeBalance.create({ pending: balance.pending });
    } else {
        record.pending = balance.pending;
        await record.save();
    }
    console.log('Stripe pending balance saved in DB:', balance.pending);
}

async function updateSyncStatus() {
    const now = new Date();
    let syncRecord = await SyncStatus.findOne();
    if (!syncRecord) {
        await SyncStatus.create({ lastSynced: now });
    } else {
        syncRecord.lastSynced = now;
        await syncRecord.save();
    }
}

async function runTasks() {
    console.log('Scheduler execution started.');
    if (config.plaid.updatesEnabled) {
        try { await processBankData(); } catch (err) { console.error('Error processing bank data:', err); }
    } else {
        console.log('Plaid updates are disabled.');
    }

    if (config.stripe.updatesEnabled) {
        try { await processStripeCharges(); } catch (err) { console.error('Error processing stripe charges:', err); }
        try { await processStripeBalance(); } catch (err) { console.error('Error processing stripe balance:', err); }
    } else {
        console.log('Stripe updates are disabled.');
    }

    if (config.plaid.updatesEnabled || config.stripe.updatesEnabled) {
        await updateSyncStatus();
    } else {
        console.log('No updates enabled, skipping sync status update.');
    }
    console.log('Scheduler execution finished.');
}

cron.schedule(config.scheduler.interval, async () => {
    await runTasks();
});

console.log('Scheduler started with interval:', config.scheduler.interval);

// Immediately run tasks once when starting
// runTasks();
