const debug = require('debug')('main:bot:inline-search:google');
const { google } = require('googleapis');
const htmlEntities = require('he');
const { sendNothingFound } = require('./common');
const _ = require('lodash');

const [apiKey, engineId] = [
  process.env.GOOGLE_API_KEY,
  process.env.GCS_ENGINE_ID,
];
const resultsPerPage = 10;
const cacheTime = 86400; // one day

const customSearch = google.customsearch('v1');

/**
 * Handler for inline google search queries.
 *
 * @param {String} query Query string, that will be used for searching. Used when query have to be modified before calling this handler.
 * @param {Object} ctx Request context
 */
module.exports = async function googleSearch(query, ctx) {
  if (!query) {
    debug('Empty query');
    return await ctx.answerInlineQuery([], {
      cache_time: cacheTime,
    });
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
    return await sendNothingFound(ctx, cacheTime);
  }

  debug('Sending answer for %s', query);
  return await ctx.answerInlineQuery(inlineResults, {
    // if search didn't give a result, then there is no more results,
    // so setting next_offset to empty value will prevent
    // telegram from sending "Load More" requests
    next_offset: inlineResults.length ? offset + resultsPerPage : '',
    cache_time: cacheTime,
  });
};

/**
 * Searches by given parameters and returns
 * result in a schema for answering to inline queries.
 *
 * @private
 * @param {String} query
 * @param {String} lang Language code (ISO format) relative which the search result will be returned
 * @param {Number} start Search result count from which items will start. Eg. if the first page had 10 items, the next page will start with 11th item.
 * @returns {Object[]}
 */
async function _googleSearchAPI(query, lang, start) {
  debug('Requesting CSE %s', query);
  const res = await customSearch.cse.list({
    cx: engineId,
    auth: apiKey,
    q: query,
    hl: lang,
    start: start,
    num: resultsPerPage,
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
 * @param {Object[]} items
 * @returns {Object[]}
 */
function _formatSearchItems(items) {
  const inlineQueryAnswer = items.map((item, i) => {
    const thumb = _resolveThumb(item);
    return {
      type: 'article',
      id: i,
      title: item.title || '',
      url: item.link || '',
      description: item.snippet || '',
      thumb_url: thumb.url || undefined,
      thumb_width: thumb.width || undefined,
      thumb_height: thumb.height || undefined,
      input_message_content: {
        message_text:
          '<b>' +
          htmlEntities.encode(item.title || '', {
            useNamedReferences: false,
          }) +
          '</b>\n' +
          htmlEntities.encode(item.link || '', {
            useNamedReferences: false,
          }),
        parse_mode: 'HTML',
      },
    };
  });

  return inlineQueryAnswer;
}

/**
 * Finds most usable thumbnail for given
 * search result item.
 *
 * @private
 * @param {Object} item Search result item.
 * @returns {{url: String, width: Number, height: Number}}
 */
function _resolveThumb(item) {
  if (
    _.isFunction(_.get(item, 'pagemap.cse_thumbnail[0].src.match', null)) &&
    item.pagemap.cse_thumbnail[0].src.match(/^(https?:\/\/).+/)
  ) {
    return {
      url: item.pagemap.cse_thumbnail[0].src,
      width: item.pagemap.cse_thumbnail[0].width || null,
      height: item.pagemap.cse_thumbnail[0].height || null,
    };
  }

  if (
    _.isFunction(_.get(item, 'pagemap.cse_image[0].src.match', null)) &&
    item.pagemap.cse_image[0].src.match(/^(https?:\/\/).+/)
  ) {
    return {
      url: item.pagemap.cse_image[0].src,
      width: item.pagemap.cse_image[0].width || null,
      height: item.pagemap.cse_image[0].height || null,
    };
  }

  return {
    url: null,
    width: null,
    height: null,
  };
}
