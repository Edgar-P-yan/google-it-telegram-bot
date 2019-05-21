const debug = require('debug')('main:bot:inline-search');
const logger = require('./../../logger');
const {
  googleSearch,
  googleSearchImage,
  resultsPerPage,
} = require('./google-search-api');

const cacheTime = 86400; // one day

module.exports = async ctx => {
  try {
    debug(
      'Inline query user: %s, query: %O',
      ctx.message.from.username,
      ctx.inlineQuery,
    );

    const offset = parseInt(ctx.inlineQuery.offset) || 0;
    let query = ctx.inlineQuery.query.trim();

    if (!query) {
      debug('Empty query');
      return ctx.answerInlineQuery([], { cache_time: cacheTime });
    }

    let inlineQueryResults = null;

    debug('Searching for: %s', query);
    if (query.match(/\simages?$/)) {
      query = query.replace(/\simages?$/, '');
      inlineQueryResults = await googleSearchImage(query, offset + 1);
    } else {
      inlineQueryResults = await googleSearch(query, offset + 1);
    }
    debug('Done searching for: %s', query);

    // Sending "Nothing Found" message only when
    // offset === 0, in other words, when requested
    // the first page of results. (see 'offset' parameter in telegrams' docs )
    if (offset === 0 && inlineQueryResults.length === 0) {
      debug('Nothing was found for: %s', query);
      return sendNothingFound(ctx);
    }

    debug('Answering to inline query "%s"', query);
    return ctx.answerInlineQuery(inlineQueryResults, {
      // if search didn't give a result, then there is no more results,
      // so setting next_offset to empty value will prevent
      // telegram from sending "Load More" requests
      next_offset: inlineQueryResults.length ? offset + resultsPerPage : '',
      cache_time: cacheTime, // one day
    });
  } catch (err) {
    debug('Error: %O', err);
    logger.error({ error: err });
    return sendErrorResult(ctx);
  }
};

function sendNothingFound(ctx) {
  return ctx.answerInlineQuery(
    [
      {
        type: 'article',
        id: '0',
        title: 'Sorry 😕. Nothing was found.',
        input_message_content: {
          message_text: 'Sorry 😕. Nothing was found.',
        },
      },
    ],
    {
      cache_time: cacheTime,
    },
  );
}

function sendErrorResult(ctx) {
  return ctx.answerInlineQuery([
    {
      type: 'article',
      id: '0',
      title: 'We are sorry 😥. Error ocurred.',
      input_message_content: {
        message_text: 'We are sorry 😥. Error ocurred.',
      },
    },
  ]);
}
