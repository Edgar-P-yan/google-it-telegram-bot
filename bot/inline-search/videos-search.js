const debug = require('debug')('app:bot:inline-search:videos');
const { sendNothingFound } = require('./common');
const htmlEntities = require('he');
const youtube = require('googleapis').google.youtube('v3');

const apiKey = process.env.GOOGLE_API_KEY;
const cacheTime = 86400; // one day

/**
 * Handler for inline videos search queries.
 *
 * @param {String} query Query string, that will be used for searching. Used when query have to be modified before calling this handler.
 * @param {Object} ctx Request context
 */
module.exports = async function videosSearch(query, ctx) {
  if (!query) {
    debug('Empty query');
    return ctx.answerInlineQuery([], { cache_time: cacheTime });
  }

  const pageToken = ctx.inlineQuery.offset || undefined;

  const { results, nextPageToken } = await _searchYoutube(
    query,
    ctx.from.language_code,
    pageToken,
  );

  if (results.length === 0) {
    debug('Nothing found for %s', query);
    return await sendNothingFound(ctx, cacheTime);
  }

  debug('Sending answer for %s', query);
  return await ctx.answerInlineQuery(results, {
    next_offset: nextPageToken || undefined,
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
 * @param {Number?} pageToken Token from page that should be returned. If omitted, first page will be returned. (read about this in YouTube Data API docs)
 * @returns {{nextPageToken: String, results: Object[]}}
 */
async function _searchYoutube(query, lang, pageToken) {
  debug('Requesting YouTube %s', query);
  const { data } = await youtube.search.list({
    part: 'snippet',
    q: query,
    maxResults: 20,
    type: 'video',
    videoEmbeddable: true,
    relevanceLanguage: lang,
    key: apiKey,
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
 * @param {Object[]} items
 */
function _formatYouTubeSearchItems(items) {
  return items.map((item, i) => {
    return {
      type: 'video',
      id: i,
      video_url: 'https://www.youtube.com/embed/' + item.id.videoId,
      mime_type: 'text/html',
      thumb_url: item.snippet.thumbnails.default.url,
      title: item.snippet.title,
      description: item.snippet.channelTitle,
      input_message_content: {
        message_text:
          '<b>🎞️ ' +
          htmlEntities.encode(item.snippet.title || '', {
            useNamedReferences: false,
          }) +
          '</b>\n' +
          htmlEntities.encode(
            'http://www.youtube.com/watch?v=' + (item.id.videoId || ''),
            {
              useNamedReferences: false,
            },
          ),
        parse_mode: 'HTML',
      },
    };
  });
}
