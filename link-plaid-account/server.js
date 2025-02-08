require('dotenv').config({ path: '../.env' });
const express = require('express');
const path = require('path');
// Change import to destructure Configuration, PlaidApi, and PlaidEnvironments
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Use PlaidEnvironments for the basePath
const PLAID_ENV =
  process.env.PLAID_ENV === 'production'
    ? PlaidEnvironments.Production
    : process.env.PLAID_ENV === 'development'
      ? PlaidEnvironments.Development
      : PlaidEnvironments.Sandbox;

// Create configuration with baseOptions (headers)
const configuration = new Configuration({
  basePath: PLAID_ENV,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

// Instantiate PlaidApi using the configuration
const plaidClient = new PlaidApi(configuration);

// Endpoint to create a link token - use linkTokenCreate
app.post('/api/create_link_token', async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: 'admin' },
      client_name: 'Seattle TransAction Fund',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
      linkCustomizationName: 'default',
    });
    res.json(response.data);
  } catch (err) {
    console.error('Plaid API error:', err.response?.data || err.message); // improved logging
    res.status(500).send(err.response?.data || err.message);
  }
});

// Endpoint to exchange public token for access token - use itemPublicTokenExchange
app.post('/api/exchange_public_token', async (req, res) => {
  try {
    const { public_token } = req.body;
    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.response?.data || err.message);
  }
});

const PORT = 3123;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
