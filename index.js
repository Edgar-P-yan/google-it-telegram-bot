require('./config-env')();
const debug = require('debug')('main');
const logger = require('./logger');

try {
  const bot = require('./bot');

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
