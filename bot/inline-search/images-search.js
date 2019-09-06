const debug = require('debug')('app:bot:inline-search:google');
const { google } = require('googleapis');
const { sendNothingFound } = require('./common');

const {GOOGLE_API_KEY, GCS_ENGINE_ID} = process.env

const resultsPerPage = 10;
const cacheTime = 86400;

const customSearch = google.customsearch('v1');

/**
 * Handler for inline images search queries.
 *
 * @param {String} query Query string, that will be used for searching. Used when query have to be modified before calling this handler.
 * @param {Object} ctx Request context
 */
module.exports = async function imagesSearch(query, ctx) {
  if (!query) {
    debug('Empty query');
    return await ctx.answerInlineQuery([], {
      cache_time: cacheTime,
    });
  }

  const offset = +ctx.inlineQuery.offset || 0;

  const inlineResults = await _googleImagesAPI(
    query,
    ctx.from.language_code,
    offset + 1,
  );

  if (inlineResults.length === 0 && offset === 0) {
    // Sending "Nothing Found" message only when
    // offset === 0, in other words, when requested
    // the first page of results. (see 'offset' parameter in telegrams' docs )
    return await sendNothingFound(ctx, cacheTime);
  }

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
async function _googleImagesAPI(query, lang, start) {
  const res = await customSearch.cse.list({
    cx: GCS_ENGINE_ID,
    auth: GOOGLE_API_KEY,
    q: query,
    hl: lang,
    start: start,
    num: resultsPerPage,
    searchType: 'image',
    fileType: 'jpeg',
    fields: 'items(link,image(width,height,thumbnailLink),title)',
  });

  return _formatImageSearchItems(res.data.items);
}

/**
 * Formats search result returned from googleapis
 * to schema for answering to inline queries.
 *
 * @private
 * @param {Object[]} items
 * @returns {Object[]}
 */

function _formatImageSearchItems(items) {
  return items.map((item, i) => {
    return {
      type: 'photo',
      id: i,
      photo_url: item.link,
      photo_width: item.image.width,
      photo_height: item.image.height,
      title: item.title || '',
      thumb_url: item.image.thumbnailLink || undefined,
    };
  });
}
