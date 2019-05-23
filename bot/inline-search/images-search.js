const debug = require('debug')('main:bot:inline-search:google');
const { google } = require('googleapis');
const { sendNothingFound } = require('./common');

const [apiKey, engineId] = [
  process.env.GOOGLE_API_KEY,
  process.env.GCS_ENGINE_ID,
];

const resultsPerPage = 10;
const cacheTime = 86400;

const customSearch = google.customsearch('v1');

module.exports = async function googleSearch(query, ctx) {
  if (!query) {
    debug('Empty query');
    return await ctx.answerInlineQuery([], {
      cache_time: cacheTime,
    });
  }

  const offset = +ctx.inlineQuery.offset || 0;

  const inlineResults = await _googleImagesAPI(query, offset + 1);

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

async function _googleImagesAPI(query, start) {
  const res = await customSearch.cse.list({
    cx: engineId,
    auth: apiKey,
    q: query,
    start: start,
    num: resultsPerPage,
    searchType: 'image',
    fileType: 'jpeg',
  });

  return _formatImageSearchItems(res.data.items);
}

function _formatImageSearchItems(items) {
  return items.map((item, i) => {
    return {
      type: 'photo',
      id: i,
      photo_url: item.link,
      photo_width: item.image.width,
      photo_height: item.image.height,
      title: item.title || '',
      description: item.snippet || '',
      thumb_url: item.image.thumbnailLink || undefined,
    };
  });
}
