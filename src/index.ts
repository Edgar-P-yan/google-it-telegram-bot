import { container } from './inversify.config';
import { TYPES } from './types';
import { IBot, NSConfig } from './interfaces';
import winston from 'winston';

const botService = container.get<IBot>(TYPES.Bot);
const config = container.get<NSConfig.IService>(TYPES.Config);
const logger = container.get<winston.Logger>(TYPES.Logger);

async function bootstrap() {
  if (config.get('WEB_HOOKS')) {
    await botService.bot.telegram.setWebhook(config.get('WEB_HOOKS_SECRET_URL'));

    await botService.bot.launch({
      webhook: {
        hookPath: config.get('WEB_HOOKS_PATH'),
        port: config.get('PORT'),
      }
    })

    logger.info('Bot launched. mode: Webhook');
  } else {
    await botService.bot.launch();

    logger.info('Bot launched. mode: long-polling');
  }
}

bootstrap().catch(error => {
  logger.error(`BootstrapError`, { error });
  // tslint:disable-next-line no-console
  console.error(error);
  process.exit(1);
});
