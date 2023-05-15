import { ContextMessageUpdate } from 'telegraf';
import { InlineQueryResult } from 'telegraf/typings/telegram-types';
import { encode } from '../../utils/he-encode';
import { youtube_v3 } from 'googleapis';
import winston from 'winston';
import { YoutubeAPI } from '../../searchers/youtube-api/youtube-api';
import { NothingFoundResponse } from '../../responses/nothing-found-response';

export class BotVideosSearchCommand {
  private CACHE_TIME = 86400; // one day

  constructor(
    private readonly youtubeApi: YoutubeAPI,
    private readonly logger: winston.Logger,
  ) {}

  /**
   * Handler for inline videos search queries.
   *
   * @param query Query string, that will be used for
   * searching. Used when query have to be modified
   * before calling this handler.
   * @param ctx Request context
   */
  public async act(query: string, ctx: ContextMessageUpdate): Promise<void> {
    if (!query) {
      this.logger.info('Empty query');
      ctx.answerInlineQuery([], { cache_time: this.CACHE_TIME });
      return;
    }

    const pageToken = ctx.inlineQuery.offset || undefined;

    const { results, nextPageToken } = await this.searchYoutube(
      query,
      ctx.from.language_code,
      pageToken,
    );

    if (results.length === 0) {
      this.logger.info('Nothing found');
      await new NothingFoundResponse().send(ctx, this.CACHE_TIME);
      return;
    }

    this.logger.info('Sending answer');
    await ctx.answerInlineQuery(results, {
      next_offset: nextPageToken || undefined,
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
   * @param pageToken Token from page that should be returned.
   * If omitted, first page will be returned. (read about
   * this in YouTube Data API docs)
   */
  private async searchYoutube(
    query: string,
    lang: string,
    pageToken: string,
  ): Promise<{
    nextPageToken: string;
    results: InlineQueryResult[];
  }> {
    this.logger.info('Requesting YouTube');
    const res = await this.youtubeApi.search({
      q: query,
      relevanceLanguage: lang,
      pageToken,
    });

    this.logger.info('Result received from YouTube');

    return {
      nextPageToken: res.nextPageToken,
      results: this.formatYouTubeSearchItems(res.items),
    };
  }

  /**
   * Formats search result returned from googleapis
   * to schema for answering to inline queries.
   */
  private formatYouTubeSearchItems(
    items: youtube_v3.Schema$SearchResult[],
  ): InlineQueryResult[] {
    return items.map((item, i) => {
      return {
        type: 'video',
        id: i.toString(),
        video_url: `https://www.youtube.com/embed/${item.id.videoId}`,
        mime_type: 'text/html',
        thumb_url: item.snippet.thumbnails.default.url,
        title: item.snippet.title,
        description: item.snippet.channelTitle,
        input_message_content: {
          message_text:
            `<b>🎞️ ${encode(item.snippet.title || '')}</b>\n` +
            encode(`http://www.youtube.com/watch?v=${item.id.videoId || ''}`),
          parse_mode: 'HTML',
        },
      };
    });
  }
}
