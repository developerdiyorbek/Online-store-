const TELEGRAM_BOT = require("node-telegram-bot-api");
const bot = new TELEGRAM_BOT(process.env.BOT_TOKEN, { polling: true });

module.exports = { bot };

// on message
require("./message");
require("./query");
