require('./config-env')();
const debug = require('debug')('main');
const logger = require('./logger');

try {
  const bot = require('./bot');

  bot
    .launch()
    .then(res => {
      debug('launched');
      debug(res);
    })
    .catch(err => {
      logger.error({ error: err });
      debug('Error: %O', err);
      process.exit(1);
    });
} catch (err) {
  logger.error({ error: err });
  debug('Error: %O', err);
  process.exit(1);
}
