import {ContextMessageUpdate} from 'telegraf'
import {InlineQueryResult} from 'telegraf/typings/telegram-types'
import { sendNothingFound } from './common';
import {encode} from './../../utils/he-encode'
import {google, youtube_v3 } from 'googleapis'
import _debug from 'debug'
const debug = _debug('app:bot:inline-search:videos');
const youtube = google.youtube('v3');
const {GOOGLE_API_KEY} = process.env;
const CACHE_TIME = 86400; // one day

/**
 * Handler for inline videos search queries.
 *
 * @param {String} query Query string, that will be used for searching. Used when query have to be modified before calling this handler.
 * @param {ContextMessageUpdate} ctx Request context
 */
export default async function videosSearch(query: string, ctx: ContextMessageUpdate): Promise<void> {
  if (!query) {
    debug('Empty query');
    ctx.answerInlineQuery([], { cache_time: CACHE_TIME });
    return
  }

  const pageToken = ctx.inlineQuery.offset || undefined;

  const { results, nextPageToken } = await _searchYoutube(
    query,
    ctx.from.language_code,
    pageToken,
  );

  if (results.length === 0) {
    debug('Nothing found for %s', query);
    await sendNothingFound(ctx, CACHE_TIME);
    return;
  }

  debug('Sending answer for %s', query);
  await ctx.answerInlineQuery(results, {
    next_offset: nextPageToken || undefined,
    cache_time: CACHE_TIME,
  });
};

/**
 * Searches by given parameters and returns
 * result in a schema for answering to inline queries.
 *
 * @private
 * @param {String} query
 * @param {String} lang Language code (ISO format) relative which the search result will be returned
 * @param {String?} pageToken Token from page that should be returned. If omitted, first page will be returned. (read about this in YouTube Data API docs)
 * @returns {Promise<{nextPageToken: String, results: InlineQueryResult[]}>}
 */
async function _searchYoutube(
  query: string, 
  lang: string, 
  pageToken: string
): Promise<{
  nextPageToken: string,
  results: InlineQueryResult[]
}> {
  debug('Requesting YouTube %s', query);
  const { data } = await youtube.search.list({
    part: 'snippet',
    q: query,
    maxResults: 20,
    type: 'video',
    videoEmbeddable: 'true',
    relevanceLanguage: lang,
    key: GOOGLE_API_KEY,
    pageToken: pageToken || undefined,
    fields:
      'items(id/videoId,snippet(channelTitle,thumbnails/default/url,title)),nextPageToken',
  });
  debug('Result received from YouTube for %s', query);

  return {
    nextPageToken: data.nextPageToken,
    results: _formatYouTubeSearchItems(data.items),
  };
}

/**
 * Formats search result returned from googleapis
 * to schema for answering to inline queries.
 *
 * @private
 * @param {InlineQueryResult[]} items
 */
function _formatYouTubeSearchItems(items: youtube_v3.Schema$SearchResult[]): InlineQueryResult[] {
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
