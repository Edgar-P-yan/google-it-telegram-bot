import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';
import { NSBotInlineQueryHandlers, IBotHelpers } from '../../interfaces';
import { ContextMessageUpdate } from 'telegraf';
import { QueryType } from './constants';
import winston from 'winston';

@injectable()
export class BotInlineQueryHandler
  implements NSBotInlineQueryHandlers.IInlineQueryHandler {
  constructor(
    @inject(TYPES.Logger)
    private readonly logger: winston.Logger,
    @inject(TYPES.BotGoogleSearchHandler)
    private readonly googleSearchHandler: NSBotInlineQueryHandlers.ISpecificSearchTypeHandler,
    @inject(TYPES.BotImageSearchHandler)
    private readonly imageSearchHandler: NSBotInlineQueryHandlers.ISpecificSearchTypeHandler,
    @inject(TYPES.BotVideosSearchHandler)
    private readonly videosSearchHandler: NSBotInlineQueryHandlers.ISpecificSearchTypeHandler,
    @inject(TYPES.BotHelpers)
    private readonly botHelpers: IBotHelpers,
  ) {}

  public async handler(ctx: ContextMessageUpdate): Promise<void> {
    try {
      const { query, queryType } = this.formatQuery(ctx);

      this.logger.info('Inline query');

      switch (queryType) {
        case QueryType.SEARCH:
          await this.googleSearchHandler.handle(query, ctx);
          break;

        case QueryType.IMAGES:
          await this.imageSearchHandler.handle(query, ctx);
          break;

        case QueryType.VIDEOS:
          await this.videosSearchHandler.handle(query, ctx);
          break;
      }

      this.logger.info('Query processed');
    } catch (error) {
      this.logger.error({ error });
      return await this.botHelpers.sendErrorResult(ctx);
    }
  }

  /**
   * Detects the queryType (what query is searching for),
   * it can be one of "IMAGES" | "VIDEOS" | "SEARCH"
   * and modifies query if needed.
   */
  private formatQuery(
    ctx: ContextMessageUpdate,
  ): {
    query: string;
    queryType: QueryType;
  } {
    let query = ctx.inlineQuery.query.trim();
    let queryType: QueryType = null;

    if (query.match(/\simages?$/)) {
      query = query.replace(/\simages?$/, '').trim();
      queryType = QueryType.IMAGES;
    } else if (query.match(/\svideos?$/)) {
      query = query.replace(/\svideos?$/, '').trim();
      queryType = QueryType.VIDEOS;
    } else {
      queryType = QueryType.SEARCH;
    }

    return {
      query,
      queryType,
    };
  }
}
