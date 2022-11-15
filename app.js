const express = require('express'),
    cors = require('cors');
if (!process.env.LOADED) require('dotenv-json')();
const botRouter = require('./botRouter');

const app = express();

app.use(cors());
app.disable('x-powered-by');
app.use(express.json());

app.get('/ping', (_, res) => res.send('pong'));
app.get('/env', (_, res) => res.send(process.env.LOADED));
app.use('/bot', botRouter);

module.exports = app;