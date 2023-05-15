import Telegraf, { ContextMessageUpdate, Extra } from 'telegraf';
import winston from 'winston';
import { NoDirectRequestsInGroupsMiddleware } from './middlewares/no-direct-requests-in-groups';
import { InlineRouter } from '../inline-router/inline-router';
import { ClsNS } from '../cls-ns/cls-ns-factory';
import { LoggerFactory } from '../logger/logger-factory';
import { LoggingMiddleware } from './middlewares/logging-middleware';

export interface BotParams {
  botToken: string;
  webHooks: boolean;
  webHooksSecretUrl?: string;
  webHooksPath?: string;
  port?: number;
}

export class Bot {
  private bot: Telegraf<ContextMessageUpdate>;
  private markup: Extra;

  constructor(
    private readonly params: BotParams,
    private readonly logger: winston.Logger,
    private readonly loggerFactory: LoggerFactory,
    private readonly inlineRouter: InlineRouter,
    private readonly clsNs: ClsNS,
  ) {
    this.bot = this.initBot();

    this.markup = Extra.markdown();
  }

  public async launch(): Promise<void> {
    if (this.params.webHooks) {
      await this.bot.telegram.setWebhook(this.params.webHooksSecretUrl);

      await this.bot.launch({
        webhook: {
          hookPath: this.params.webHooksPath,
          port: this.params.port,
        },
      });

      this.logger.info('Bot launched. mode: Webhook');
    } else {
      await this.bot.launch();

      this.logger.info('Bot launched. mode: long-polling');
    }
  }

  private initBot(): Telegraf<ContextMessageUpdate> {
    const bot = new Telegraf(this.params.botToken);

    bot.use(
      new LoggingMiddleware(
        this.loggerFactory.get('LoggingMiddleware'),
      ).getMiddlewareFunction(),
    );

    bot.catch((error: unknown) => {
      this.logger.error({ error });
    });

    bot.use((ctx, next) => {
      return this.clsNs.get().runAndReturn(() => {
        this.clsNs.get().set('bot_context', ctx);
        return next();
      });
    });

    bot.use(new NoDirectRequestsInGroupsMiddleware().getMiddlewareFunction());

    bot.start(this.startCommandHandler());
    bot.help(this.helpCommandHandler());
    bot.on('inline_query', async (ctx) => {
      await this.inlineRouter.handler(ctx);
    });

    return bot;
  }

  private helpCommandHandler() {
    return async (ctx: AdditionalKeys<ContextMessageUpdate>): Promise<void> => {
      this.logger.info('Command /help');
      await ctx.reply(
        'Type `@' +
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (ctx.botInfo as any)?.username +
          ' funny cats` and you will see search result.\n' +
          'Then click on them to send to me!',
        this.markup,
      );
    };
  }

  private startCommandHandler() {
    return async (ctx: ContextMessageUpdate): Promise<void> => {
      this.logger.info('Command /start');
      await ctx.reply(
        `Hi ${ctx.from.first_name} ${ctx.from.last_name || ''}! 🎉\n` +
          'I am an inline bot for searching *WEB*, *IMAGES*, *VIDEOS*.\n' +
          'Usage.\n\n' +
          '🔎 First of all, type `@Google_itBot `, and then type anything you' +
          'want to search. For example `@Google_itBot cats`, and it will show search results.\n' +
          '🖼️ *Wanna search images?* Just type `images` next to it. `@Google_itBot cats images`.\n' +
          '🎞️ *Wanna search videos?* Just type `videos` next to it. `@Google_itBot cats videos`.\n' +
          `📤 *Wanna share the result?* Just tap on the result.\n\n` +
          "*LET'S DO THIS*. Type `@Google_itBot funny cats images` and share with me some images of them!",
        this.markup,
      );
    };
  }
}
