import { ContextMessageUpdate } from 'telegraf';
import { QueryType } from './constants/query-type.enum';
import winston from 'winston';
import { BotGoogleSearchCommand } from '../bot-commands/bot-google-search-command/bot-google-search-command';
import { BotImageSearchCommand } from '../bot-commands/bot-image-search-command/bot-image-search-command';
import { BotVideosSearchCommand } from '../bot-commands/bot-videos-search-command/bot-videos-search-command';
import { UnknownErrorResponse } from '../responses/unknown-error-response';

export class InlineRouter {
  constructor(
    private readonly logger: winston.Logger,
    private readonly botGoogleSearchCommand: BotGoogleSearchCommand,
    private readonly botImageSearchCommand: BotImageSearchCommand,
    private readonly botVideosSearchCommand: BotVideosSearchCommand,
  ) {}

  public async handler(ctx: ContextMessageUpdate): Promise<void> {
    try {
      const { query, queryType } = this.formatQuery(ctx);

      this.logger.info(`Inline query queryType: ${queryType}, query: ${query}`);

      switch (queryType) {
        case QueryType.SEARCH:
          await this.botGoogleSearchCommand.act(query, ctx);
          break;

        case QueryType.IMAGES:
          await this.botImageSearchCommand.act(query, ctx);
          break;

        case QueryType.VIDEOS:
          await this.botVideosSearchCommand.act(query, ctx);
          break;
      }

      this.logger.info('Query processed');
    } catch (error) {
      this.logger.error({ error });
      await new UnknownErrorResponse().send(ctx);
    }
  }

  /**
   * Detects the queryType (what query is searching for),
   * it can be one of "IMAGES" | "VIDEOS" | "SEARCH"
   * and modifies query if needed.
   */
  private formatQuery(ctx: ContextMessageUpdate): {
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
