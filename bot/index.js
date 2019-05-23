const logger = require('./../logger');
const debug = require('debug')('main:bot');
const bot = require('./telegraf')();
const noDirectRequestsInGroups = require('./middlewares/no-direct-requests-in-groups');

bot.catch(err => {
  debug(err);
  logger.error({ error: err });
});

bot.use(noDirectRequestsInGroups);

bot.start(require('./commands/start.command'));
bot.help(require('./commands/help.command'));

bot.on('inline_query', require('./inline-search'));

module.exports = bot;
