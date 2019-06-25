require('./config-env')();
const debug = require('debug')('app');
const logger = require('./logger');

try {
  const bot = require('./bot');

  if (
    process.env.WEB_HOOKS &&
    process.env.WEB_HOOKS.toLocaleLowerCase() === 'true'
  ) {
    bot.telegram.setWebhook(process.env.WEB_HOOKS_SECRET_URL);
    bot.startWebhook('/secret-path', null, process.env.PORT || 80);
  }

  bot
    .launch()
    .then(() => {
      debug('launched');
    })
    .catch(err => {
      logger.error({ error: err });
      debug('Error: %O', err);
      debug('Exiting process with code 1');
      process.exit(1);
    });
} catch (err) {
  logger.error({ error: err });
  debug('Error: %O', err);
  debug('Exiting process with code 1');
  process.exit(1);
}
