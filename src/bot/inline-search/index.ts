import {ContextMessageUpdate} from 'telegraf'
import _debug from 'debug'
const debug = _debug('app:bot:inline-search');
import {logger} from './../../logger';
import { sendErrorResult } from './common';
import googleSearch from './google-search';
import imagesSearch from './images-search';
import videosSearch from './videos-search';

export type QueryType = 'images' | 'videos' | 'search'

export async function inlineSearchHandler (ctx: ContextMessageUpdate): Promise<void> {
  try {
    const { query, queryType } = _formatQuery(ctx);

    debug('Inline query %O', ctx.inlineQuery);
    if (queryType === 'images') {
      return await imagesSearch(query, ctx);
    } else if (queryType === 'videos') {
      return await videosSearch(query, ctx);
    } else {
      return await googleSearch(query, ctx);
    }
  } catch (err) {
    debug('ERROR CATCHED: %s', err);
    logger.error({ error: err });
    return await sendErrorResult(ctx);
  }
};

/**
 * Detects the queryType (what query is searching for),
 * it can be one of "images" | "videos" | "search"
 * and modifies query if needed.
 *
 * @private
 * @param {ContextMessageUpdate} ctx
 * @returns {{query: String, queryType: QueryType}}
 */
function _formatQuery(ctx: ContextMessageUpdate): {
  query: string,
  queryType: QueryType
} {
  let query = ctx.inlineQuery.query.trim();
  let queryType: QueryType = null; // "images" | "videos" | "search"

  if (query.match(/\simages?$/)) {
    query = query.replace(/\simages?$/, '').trim();
    queryType = 'images';
  } else if (query.match(/\svideos?$/)) {
    query = query.replace(/\svideos?$/, '').trim();
    queryType = 'videos';
  } else {
    queryType = 'search';
  }

  return {
    query,
    queryType,
  };
}
