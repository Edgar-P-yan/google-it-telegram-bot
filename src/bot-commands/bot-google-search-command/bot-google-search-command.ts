import { ContextMessageUpdate } from 'telegraf';
import { InlineQueryResult } from 'telegraf/typings/telegram-types';
import { customsearch_v1 } from 'googleapis';
import { encode } from '../../utils/he-encode';
import _ from 'lodash';
import winston from 'winston';
import { GoogleCSE } from '../../searchers/google-cse/google-cse';
import { NothingFoundResponse } from '../../responses/nothing-found-response';

export class BotGoogleSearchCommand {
  private RESULTS_PER_PAGE = 10;
  private CACHE_TIME = 86400; // one day

  constructor(
    private readonly googleCse: GoogleCSE,
    private readonly logger: winston.Logger,
  ) {}

  /**
   * Handler for inline google search queries.
   *
   * @param query Query string, that will be used for searching.
   *  Used when query have to be modified before calling this handler.
   * @param ctx Request context
   */
  public async act(query: string, ctx: ContextMessageUpdate): Promise<void> {
    this.logger.info(query);
    if (!query) {
      this.logger.info('Empty query');
      await ctx.answerInlineQuery([], {
        cache_time: this.CACHE_TIME,
      });
      return;
    }

    const offset = +ctx.inlineQuery.offset || 0;

    const inlineResults = await this.googleSearchAPI(
      query,
      ctx.from.language_code,
      offset + 1,
    );

    if (inlineResults.length === 0 && offset === 0) {
      // Sending "Nothing Found" message only when
      // offset === 0, in other words, when requested
      // the first page of results. (see 'offset' parameter in telegrams' docs )
      this.logger.info('Nothing found');
      await new NothingFoundResponse().send(ctx, this.CACHE_TIME);
      return;
    }

    this.logger.info('Sending answer');
    await ctx.answerInlineQuery(inlineResults, {
      // if search didn't give a result, then there is no more results,
      // so setting next_offset to empty value will prevent
      // telegram from sending "Load More" requests
      next_offset: _.toString(
        inlineResults.length ? offset + this.RESULTS_PER_PAGE : '',
      ),
      cache_time: this.CACHE_TIME,
    });
  }

  /**
   * Searches by given parameters and returns
   * result in a schema for answering to inline queries.
   *
   * @param query
   * @param lang Language code (ISO format) relative
   * which the search result will be returned
   * @param start Search result count from which
   * items will start. Eg. if the first page had 10 items,
   * the next page will start with 11th item.
   */
  private async googleSearchAPI(
    query: string,
    lang: string,
    start: number,
  ): Promise<InlineQueryResult[]> {
    this.logger.info('Requesting CSE');
    const items = await this.googleCse.search({
      q: query,
      hl: lang,
      start,
      num: this.RESULTS_PER_PAGE,
    });

    this.logger.info('Result received from CSE');

    return this.formatSearchItems(items);
  }

  /**
   * Formats search result returned from googleapis
   * to schema for answering to inline queries.
   */
  private formatSearchItems(
    items: customsearch_v1.Schema$Result[],
  ): InlineQueryResult[] {
    return items.map((item, i) => {
      const thumb = this.resolveThumb(item);
      return {
        type: 'article',
        id: _.toString(i),
        title: item.title || '',
        url: item.link || '',
        description: item.snippet || '',
        thumb_url: thumb.url,
        thumb_width: thumb.width,
        thumb_height: thumb.height,
        input_message_content: {
          message_text: `<b>${encode(item.title || '')}</b>\n${encode(
            item.link || '',
          )}`,
          parse_mode: 'HTML',
        },
      };
    });
  }

  /**
   * Finds most usable thumbnail for given
   * search result item.
   *
   * @private
   * @param item Search result item.
   */
  private resolveThumb(item: customsearch_v1.Schema$Result): {
    url?: string;
    width?: number;
    height?: number;
  } {
    const thumbObjPath = [
      'pagemap.cse_thumbnail[0]',
      'pagemap.cse_image[0]',
    ].find((_thumbObjPath) =>
      /^(https?:\/\/).+/.test(_.get(item, _thumbObjPath, '')),
    );
    const thumbObj = thumbObjPath ? _.get(item, thumbObjPath, {}) : {};

    return {
      url: thumbObj.src || undefined,
      width: +thumbObj.width || undefined,
      height: +thumbObj.height || undefined,
    };
  }
}
