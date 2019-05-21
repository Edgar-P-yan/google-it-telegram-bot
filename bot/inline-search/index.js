const debug = require('debug')('main:bot:inline-search');
const logger = require('./../../logger');
const googleSearch = require('./google-search-api');
const htmlEntities = require('he');

const resultsPerPage = googleSearch.resultsPerPage;
const cacheTime = 86400; // one day

module.exports = async ctx => {
  try {
    debug('Inline query: %O', ctx.inlineQuery);

    const offset = parseInt(ctx.inlineQuery.offset) || 0;
    const query = ctx.inlineQuery.query.trim();

    if (!query) {
      debug('Empty query');

      return ctx.answerInlineQuery([], { cache_time: cacheTime });
    }

    debug('Searching for: %s', query);

    const results = await googleSearch(query, offset);

    debug('Done searching for: %s', query);

    // Sending Nothing Found message only when
    // offset === 0, in other words, when requested
    // the first page of results. (see 'offset' parameter in telegrams' docs )
    if (offset === 0 && results.length === 0) {
      debug('Nothing was found for: %s', query);

      return sendNothingFound(ctx, { cacheTime });
    }

    const inlineResults = results.map((result, i) => {
      return {
        type: 'article',
        id: i,
        title: result.title,
        url: result.href,
        input_message_content: {
          message_text:
            '<b>' +
            htmlEntities.encode(result.title, { useNamedReferences: false }) +
            '</b>\n' +
            htmlEntities.encode(result.href, { useNamedReferences: false }),
          parse_mode: 'HTML',
        },
        description: result.description || '',
      };
    });

    debug('Answering to inline query "%s"', query);

    return ctx.answerInlineQuery(inlineResults, {
      // if search didn't give a result, then there is no more results
      next_offset: results.length ? resultsPerPage + offset : '',
      cache_time: cacheTime, // one day
    });
  } catch (err) {
    debug('Error: %O', err);
    logger.error({ error: err });

    return sendErrorResult(ctx);
  }
};

function sendNothingFound(ctx, { cacheTime }) {
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
