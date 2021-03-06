import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';
import {
  NSConfig,
  NSYoutubeAPI,
  IBot,
  NSGoogleCSE,
  NSBotInlineQueryHandlers,
  IBotHelpers,
} from './interfaces';
import { ConfigService } from './services/config/config.service';
import { BotService } from './services/bot/bot.service';
import { YoutubeAPI } from './services/youtube-api';
import { GoogleCSEService } from './services/google-cse';
import { BotGoogleSearchHandler } from './services/bot-google-search-handler';
import { BotImageSearchHandler } from './services/bot-image-search-handler';
import { BotVideosSearchHandler } from './services/bot-videos-search-handler';
import { BotInlineQueryHandler } from './services/bot-inline-query-handler';
import { Logger } from 'winston';
import { loggerDynamicValueFactory } from './services/logger';
import { BotHelpers } from './services/bot-helpers';
import dotenv from 'dotenv';

const container = new Container();

container.bind<Logger>(TYPES.Logger).toDynamicValue(loggerDynamicValueFactory);

dotenv.config();
container
  .bind<NSConfig.IService>(TYPES.Config)
  .toConstantValue(new ConfigService(process.env));

container.bind<NSGoogleCSE.IService>(TYPES.GoogleCSE).to(GoogleCSEService);
container.bind<NSYoutubeAPI.IService>(TYPES.YoutubeAPI).to(YoutubeAPI);
container.bind<IBotHelpers>(TYPES.BotHelpers).to(BotHelpers);

container
  .bind<NSBotInlineQueryHandlers.ISpecificSearchTypeHandler>(
    TYPES.BotGoogleSearchHandler,
  )
  .to(BotGoogleSearchHandler);
container
  .bind<NSBotInlineQueryHandlers.ISpecificSearchTypeHandler>(
    TYPES.BotImageSearchHandler,
  )
  .to(BotImageSearchHandler);
container
  .bind<NSBotInlineQueryHandlers.ISpecificSearchTypeHandler>(
    TYPES.BotVideosSearchHandler,
  )
  .to(BotVideosSearchHandler);

container
  .bind<NSBotInlineQueryHandlers.IInlineQueryHandler>(
    TYPES.BotInlineQueryHandler,
  )
  .to(BotInlineQueryHandler);

container.bind<IBot>(TYPES.Bot).to(BotService);

export { container };
