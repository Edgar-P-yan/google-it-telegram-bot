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

  const inlineResults = await _googleSearchAPI(query, offset + 1);

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

async function _googleSearchAPI(query, start) {
  debug('Requesting CSE %s', query);
  const res = await customSearch.cse.list({
    cx: engineId,
    auth: apiKey,
    q: query,
    start: start,
    num: resultsPerPage,
  });
  debug('Result received from CSE for %s', query);

  return _formatSearchItems(res.data.items || []);
}

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
