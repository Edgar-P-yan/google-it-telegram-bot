import {ContextMessageUpdate} from 'telegraf'
import {InlineQueryResult} from 'telegraf/typings/telegram-types'
import {google, customsearch_v1} from 'googleapis'
import {encode} from './../../utils/he-encode'
import {sendNothingFound} from './common'
import _ from 'lodash'
import * as config from './../../config'
import _debug from 'debug'
const debug = _debug('app:bot:inline-search:google');
const customSearch = google.customsearch('v1');

const RESULTS_PER_PAGE = 10;
const CACHE_TIME = 86400; // one day

/**
 * Handler for inline google search queries.
 *
 * @param {String} query Query string, that will be used for searching. Used when query have to be modified before calling this handler.
 * @param {Object} ctx Request context
 */
export default async function googleSearch(query: string, ctx: ContextMessageUpdate): Promise<void> {
  if (!query) {
    debug('Empty query');
    await ctx.answerInlineQuery([], {
      cache_time: CACHE_TIME,
    });
    return;
  }

  const offset = +ctx.inlineQuery.offset || 0;

  const inlineResults = await _googleSearchAPI(
    query,
    ctx.from.language_code,
    offset + 1,
  );

  if (inlineResults.length === 0 && offset === 0) {
    // Sending "Nothing Found" message only when
    // offset === 0, in other words, when requested
    // the first page of results. (see 'offset' parameter in telegrams' docs )
    debug('Nothing found for %s', query);
    await sendNothingFound(ctx, CACHE_TIME);
    return;
  }

  debug('Sending answer for %s', query);
  await ctx.answerInlineQuery(inlineResults, {
    // if search didn't give a result, then there is no more results,
    // so setting next_offset to empty value will prevent
    // telegram from sending "Load More" requests
    next_offset: _.toString(inlineResults.length ? offset + RESULTS_PER_PAGE : ''),
    cache_time: CACHE_TIME,
  });
};

/**
 * Searches by given parameters and returns
 * result in a schema for answering to inline queries.
 *
 * @private
 * @param {String} query
 * @param {String} lang Language code (ISO format) relative
 * which the search result will be returned
 * @param {Number} start Search result count from which 
 * items will start. Eg. if the first page had 10 items,
 * the next page will start with 11th item.
 * @returns {Promise<InlineQueryResult[]>}
 */
async function _googleSearchAPI(query: string, lang: string, start: number): Promise<InlineQueryResult[]> {
  debug('Requesting CSE %s', query);
  const res = await customSearch.cse.list({
    cx: config.get('GCS_ENGINE_ID'),
    auth: config.get('GOOGLE_API_KEY'),
    q: query,
    hl: lang,
    start: start,
    num: RESULTS_PER_PAGE,
    fields: 'items(title,link,snippet,pagemap(cse_thumbnail,cse_image))',
  });

  debug('Result received from CSE for %s', query);

  return _formatSearchItems(res.data.items || []);
}

/**
 * Formats search result returned from googleapis
 * to schema for answering to inline queries.
 *
 * @private
 * @param {customsearch_v1.Schema$Result[]} items
 * @returns {InlineQueryResult[]}
 */
function _formatSearchItems(items: customsearch_v1.Schema$Result[]): InlineQueryResult[] {
  return items.map((item, i) => {
    const thumb = _resolveThumb(item);
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
        message_text: `<b>${encode(item.title || '')}</b>\n${encode(item.link || '')}`,
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
 * @param {customsearch_v1.Schema$Result} item Search result item.
 * @returns {{url?: String, width?: Number, height?: Number}}
 */
function _resolveThumb(item: customsearch_v1.Schema$Result): {
  url?: string,
  width?: number,
  height?: number
} {
  const thumbObjPath = [
    'pagemap.cse_thumbnail[0]',
    'pagemap.cse_image[0]'
  ].find(thumbObjPath => /^(https?:\/\/).+/.test(_.get(item, thumbObjPath, '')))
  const thumbObj = thumbObjPath ? _.get(item, thumbObjPath, {}) : {}

  return {
    url: thumbObj.src || undefined,
    width: +thumbObj.width || undefined,
    height: +thumbObj.height || undefined,
  };
}
