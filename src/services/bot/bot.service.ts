import { injectable, inject } from 'inversify';
import Telegraf, { ContextMessageUpdate } from 'telegraf';
import Extra from 'telegraf/extra';
import SocksProxyAgent from 'socks-proxy-agent';
import _ from 'lodash';
import winston from 'winston';
import { NSConfig, IBot, NSBotInlineQueryHandlers } from '../../interfaces';
import { TYPES } from '../../types';
import { noDirectRequestsInGroups } from './middlewares';

@injectable()
export class BotService implements IBot {
  public bot: Telegraf<ContextMessageUpdate>;
  private markup: any;

  constructor(
    @inject(TYPES.Config)
    private readonly config: NSConfig.IService,
    @inject(TYPES.Logger)
    private readonly logger: winston.Logger,
    @inject(TYPES.BotInlineQueryHandler)
    private readonly inlineQueryHandler: NSBotInlineQueryHandlers.IInlineQueryHandler,
  ) {
    this.bot = this.initBot();
    this.markup = Extra.markdown();
  }

  private initBot(): Telegraf<ContextMessageUpdate> {
    const bot = this.createTelegramBot();

    bot.catch((error: any) => {
      this.logger.error({ error });
    });

    bot.use(noDirectRequestsInGroups);

    bot.start(this.startCommandHandler());
    bot.help(this.helpCommandHandler());
    bot.on(
      'inline_query',
      this.inlineQueryHandler.handler.bind(this.inlineQueryHandler),
    );

    return bot;
  }

  private createTelegramBot(): Telegraf<ContextMessageUpdate> {
    const bot = new Telegraf(this.config.get('BOT_TOKEN'), {
      telegram: {
        agent:
          (this.config.get('SOCKS_PROXY') &&
            new SocksProxyAgent(this.config.get('SOCKS_PROXY'))) ||
          null,
      },
    });

    return bot;
  }

  private helpCommandHandler() {
    return async (ctx: AdditionalKeys<ContextMessageUpdate>): Promise<void> => {
      this.logger.info('Command /help', ctx.from);
      await ctx.reply(
        'Type `@' +
          ctx.botInfo.username +
          ' funny cats` and you will see search result.\n' +
          'Then click on them to send to me!',
        this.markup,
      );
    };
  }

  private startCommandHandler() {
    return async (ctx: AdditionalKeys<ContextMessageUpdate>): Promise<void> => {
      this.logger.info('Command /start', ctx.from);
      await ctx.reply(
        `Hi ${ctx.from.first_name} ${ctx.from.last_name || ''}! 🎉\n` +
          'I am an inline bot for searching *WEB*, *IMAGES*, *VIDEOS*.\n' +
          'Usage.\n\n' +
          '🔎 First of all, type `@Google_itBot `, and then type anything you' +
          'want to search. For example `@Google_itBot cats`, and it will show search results.\n' +
          '🖼️ *Wanna search images?* Just type `images` next to it. `@Google_itBot cats images`.\n' +
          '🎞️ *Wanna search videos?* Just type `videos` next to it. `@Google_itBot cats videos`.\n' +
          `📤 *Wanna share the result?* Just tap on the result.\n\n` +
          '*LET\'S DO THIS*. Type `@Google_itBot funny cats images` and share with me some images of them!',
        this.markup,
      );
    };
  }
}
