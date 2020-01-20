import { container } from './inversify.config';
import { TYPES } from './types';
import { IBot, NSConfig } from './interfaces';
import winston from 'winston';

const botService = container.get<IBot>(TYPES.Bot);
const config = container.get<NSConfig.IService>(TYPES.Config);
const logger = container.get<winston.Logger>(TYPES.Logger);

async function bootstrap() {
  if (config.get('WEB_HOOKS')) {
    botService.bot.telegram.setWebhook(config.get('WEB_HOOKS_SECRET_URL'));
    botService.bot.startWebhook('/secret-path', null, config.get('PORT') || 80);
  }

  await botService.bot.launch();
  logger.info('Launched');
}

bootstrap().catch(error => {
  logger.error(`BootstrapError`, { error });
  // tslint:disable-next-line no-console
  console.error(error);
  process.exit(1);
});
