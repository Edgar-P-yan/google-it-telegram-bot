import { configEnv } from './config-env';
configEnv();
import { logger } from './logger';
import { bot } from './bot';
import _debug from 'debug';
const debug = _debug('app:main');

try {
  if (
    process.env.WEB_HOOKS &&
    process.env.WEB_HOOKS.toLocaleLowerCase() === 'true'
  ) {
    bot.telegram.setWebhook(process.env.WEB_HOOKS_SECRET_URL);
    bot.startWebhook('/secret-path', null, +process.env.PORT || 80);
  }

  bot
    .launch()
    .then(() => {
      debug('launched');
    })
    .catch((err: any) => {
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
