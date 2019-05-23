const logger = require('./../logger');
const debug = require('debug')('main:bot');
const bot = require('./telegraf')();
const onlyPrivate = require('./middlewares/only-private');

bot.catch(err => {
  debug(err);
  logger.error({ error: err });
});

bot.use(onlyPrivate);

bot.start(require('./commands/start.command'));
bot.help(require('./commands/help.command'));

bot.on('inline_query', require('./inline-search'));

module.exports = bot;
