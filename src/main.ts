import { Bot } from './bot/bot';
import { BotGoogleSearchCommand } from './bot-commands/bot-google-search-command/bot-google-search-command';
import { BotImageSearchCommand } from './bot-commands/bot-image-search-command/bot-image-search-command';
import { BotVideosSearchCommand } from './bot-commands/bot-videos-search-command/bot-videos-search-command';
import { ClsNS } from './cls-ns/cls-ns-factory';
import { ConfigsFromEnvFile } from './configs-from-env/configs-from-env-file';
import { InlineRouter } from './inline-router/inline-router';
import { LoggerFactory } from './logger/logger-factory';
import { GoogleCSE } from './searchers/google-cse/google-cse';
import { YoutubeAPI } from './searchers/youtube-api/youtube-api';

async function main(): Promise<void> {
  const configs = new ConfigsFromEnvFile();
  const clsNs = new ClsNS();
  const loggerFactory = new LoggerFactory(
    clsNs,
    configs.getOrDefault('LOGGING_LEVEL', 'info'),
  );
  const googleCse = new GoogleCSE({
    gcsEngineId: configs.get('GCS_ENGINE_ID'),
    googleApiKey: configs.get('GOOGLE_API_KEY'),
  });

  await new Bot(
    {
      botToken: configs.get('BOT_TOKEN'),
      webHooks: configs.getOrDefault('WEB_HOOKS', false),
      webHooksPath: configs.getOrDefault('WEB_HOOKS_PATH', ''),
      webHooksSecretUrl: configs.getOrDefault('WEB_HOOKS_SECRET_URL', ''),
      port: +configs.getOrDefault('PORT', 0),
    },
    loggerFactory.get('Bot'),
    loggerFactory,
    new InlineRouter(
      loggerFactory.get('InlineRouter'),
      new BotGoogleSearchCommand(
        googleCse,
        loggerFactory.get('BotGoogleSearchCommand'),
      ),
      new BotImageSearchCommand(
        googleCse,
        loggerFactory.get('BotImageSearchCommand'),
      ),
      new BotVideosSearchCommand(
        new YoutubeAPI({
          googleApiKey: configs.get('GOOGLE_API_KEY'),
        }),
        loggerFactory.get('BotVideosSearchCommand'),
      ),
    ),
    clsNs,
  ).launch();
}
main();
