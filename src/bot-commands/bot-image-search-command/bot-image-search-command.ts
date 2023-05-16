import { ContextMessageUpdate } from 'telegraf';
import { InlineQueryResult } from 'telegraf/typings/telegram-types';
import { customsearch_v1 } from 'googleapis';
import _ from 'lodash';
import winston from 'winston';
import { GoogleCSE } from '../../searchers/google-cse/google-cse';
import { NothingFoundResponse } from '../../responses/nothing-found-response';

export class BotImageSearchCommand {
  private RESULTS_PER_PAGE = 10;
  private CACHE_TIME = 86400;

  constructor(
    private readonly googleCse: GoogleCSE,
    private readonly logger: winston.Logger,
  ) {}

  /**
   * Handler for inline images search queries.
   *
   * @param query Query string, that will be used for searching.
   *    Used when query have to be modified before calling this handler.
   * @param ctx Request context
   */
  public async act(query: string, ctx: ContextMessageUpdate): Promise<void> {
    if (!query) {
      this.logger.info('Empty query');
      await ctx.answerInlineQuery([], {
        cache_time: this.CACHE_TIME,
      });
      return;
    }

    const offset = +ctx.inlineQuery.offset || 0;

    const inlineResults = await this.googleImagesAPI(
      query,
      ctx.from.language_code,
      offset + 1,
    );

    if (inlineResults.length === 0 && offset === 0) {
      // Sending "Nothing Found" message only when
      // offset === 0, in other words, when requested
      // the first page of results. (see 'offset' parameter in telegrams' docs )
      await new NothingFoundResponse().send(ctx, this.CACHE_TIME);
      return;
    }

    await ctx.answerInlineQuery(inlineResults, {
      // if search didn't give a result, then there is no more results,
      // so setting next_offset to empty value will prevent
      // telegram from sending "Load More" requests
      next_offset: _.toString(
        inlineResults.length ? offset + this.RESULTS_PER_PAGE : '',
      ),
      cache_time: this.CACHE_TIME,
    });

    return;
  }

  /**
   * Searches by given parameters and returns
   * result in a schema for answering to inline queries.
   *
   * @private
   * @param {String} query
   * @param {String} lang Language code (ISO format)
   * relative which the search result will be returned
   * @param {Number} start Search result count from which
   * items will start. Eg. if the first page had 10 items,
   * the next page will start with 11th item.
   * @returns {Promise<InlineQueryResult[]>}
   */
  private async googleImagesAPI(
    query: string,
    lang: string,
    start: number,
  ): Promise<InlineQueryResult[]> {
    const items = await this.googleCse.searchImages({
      q: query,
      hl: lang,
      start,
      num: this.RESULTS_PER_PAGE,
    });

    return this.formatImageSearchItems(items, start);
  }

  /**
   * Formats search result returned from googleapis
   * to schema for answering to inline queries.
   */
  private formatImageSearchItems(
    items: customsearch_v1.Schema$Result[],
    start: number,
  ): InlineQueryResult[] {
    return items.map((item, i) => {
      return {
        type: 'photo',
        id: _.toString(start + i),
        photo_url: item.link,
        photo_width: item.image.width,
        photo_height: item.image.height,
        title: item.title || '',
        thumb_url: item.image.thumbnailLink || undefined,
      };
    });
  }
}
