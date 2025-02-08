const express = require('express');
const router = express.Router();
const {
  BankBalance,
  BankWithdrawal,
  StripeCharge,
  StripeBalance,
  SyncStatus,
  AidRequest,
} = require('../db');
const { sendDiscordAidRequest } = require('../discord');

// GET /api/v1/latest – returns the latest data
router.get('/latest', async (req, res) => {
  try {
    const bankBalance = await BankBalance.findOne({
      order: [['createdAt', 'DESC']],
    });
    const bankWithdrawals = await BankWithdrawal.findAll({
      order: [['timestamp', 'DESC']],
    });
    const stripeCharges = await StripeCharge.findAll({
      order: [['date', 'DESC']],
    });
    const stripeBalance = await StripeBalance.findOne({
      order: [['createdAt', 'DESC']],
    });
    const syncStatus = await SyncStatus.findOne();
    const requests = await AidRequest.findAll({
      order: [['requestReceivedAt', 'DESC']],
    });

    res.json({
      bankBalance: bankBalance ? { amount: bankBalance.amount } : null,
      bankWithdrawals: bankWithdrawals.map((item) => ({
        timestamp: item.timestamp,
        amount: item.amount,
      })),
      stripeCharges: stripeCharges.map((item) => ({
        date: item.date,
        amount: item.amount,
      })),
      stripeBalance: stripeBalance
        ? {
            pending: (stripeBalance.pending || []).map((p) => ({
              amount: p.amount,
            })),
          }
        : null,
      lastSynced: syncStatus ? syncStatus.lastSynced : null,
      requests: requests.map((item) => ({
        amountRequested: item.amountRequested,
        category: item.category,
        state: item.state,
        requestReceivedAt: item.requestReceivedAt,
      })),
    });
  } catch (err) {
    console.error('Error fetching aggregated data:', err);
    res.status(500).json({ error: 'failed to fetch aggregated data' });
  }
});

// POST /api/v1/request – accepts an aid request
router.post('/request', async (req, res) => {
  try {
    // Log incoming request data
    console.log('Aid Request Received:', { body: req.body, ip: req.ip });
    const {
      name,
      isTrans,
      pronouns,
      amountRequested,
      category,
      description,
      neighborhood,
      socialMedia,
      contactMethod,
      contactInfo,
      receiveMethod,
    } = req.body;
    // (Optional) Validate fields if necessary.

    const userIP = req.ip;
    const requestReceivedAt = new Date();
    const newRequest = await AidRequest.create({
      name,
      isTrans,
      pronouns,
      amountRequested,
      category,
      description,
      neighborhood,
      socialMedia,
      contactMethod,
      contactInfo,
      receiveMethod,
      state: 'Submitted',
      ip: userIP,
      requestReceivedAt,
    });

    sendDiscordAidRequest({
      id: newRequest.id,
      name,
      isTrans,
      pronouns,
      amountRequested,
      category,
      description,
      neighborhood,
      socialMedia,
      contactMethod,
      contactInfo,
      receiveMethod,
      userIP,
      requestReceivedAt,
    });

    res.sendStatus(200);
  } catch (error) {
    console.error('Error saving aid request:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
