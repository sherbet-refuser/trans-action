const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const { sequelize } = require('./db');

const apiRoutes = require('./routes/api');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/v1', apiRoutes);

app.get('/', (req, res) => {
    res.send('transaction backend is running');
});

// sync db and start server
sequelize.sync().then(() => {
    app.listen(config.port, () => {
        console.log(`backend listening on port ${config.port}`);
    });
}).catch(err => {
    console.error('failed to sync db: ', err);
});
