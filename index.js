const Bot = require('./src/models/bot');
const { token } = require('./config.json');

const client = new Bot();

client.login(token)