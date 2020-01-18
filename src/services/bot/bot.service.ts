import { injectable, inject } from 'inversify';
import Telegraf, { ContextMessageUpdate } from 'telegraf';
import SocksProxyAgent from 'socks-proxy-agent';
import _ from 'lodash';
import winston from 'winston';
import { NSConfig, IBot, NSBotInlineQueryHandlers } from '../../interfaces';
import { TYPES } from '../../types';
import { noDirectRequestsInGroups } from './middlewares'
import { helpCommandHandler, startCommandHandler } from './commands'
import _debug from 'debug';
const debug = _debug('app:bot');

@injectable()
export class BotService implements IBot {
  public bot: Telegraf<ContextMessageUpdate>

  constructor(
    @inject(TYPES.Config)
    private readonly config: NSConfig.IService,
    @inject(TYPES.Logger)
    private readonly logger: winston.Logger,
    @inject(TYPES.BotInlineQueryHandler)
    private readonly inlineQueryHandler: NSBotInlineQueryHandlers.IInlineQueryHandler
  ) {
    this.bot = this.initBot()
  }

  private initBot(): Telegraf<ContextMessageUpdate> {
    const bot = this.createTelegramBot()
    
    bot.catch((err: any) => {
      debug(err);
      this.logger.error({ error: err });
    });
    
    bot.use(noDirectRequestsInGroups);
    
    bot.start(startCommandHandler);
    bot.help(helpCommandHandler);
    bot.on('inline_query', this.inlineQueryHandler.handler.bind(this.inlineQueryHandler));
    
    return bot
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
}
