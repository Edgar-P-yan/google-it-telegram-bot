const debug = require('debug')('main:bot:inline-search');
const logger = require('./../../logger');
const googleSearch = require('./google-search-api');
const markdownEscape = require('markdown-escape');

const resultsPerPage = 10;
const cacheTime = 86400; // one day

module.exports = async ctx => {
  try {
    debug('Inline query: %O', ctx.inlineQuery);
    const offset = parseInt(ctx.inlineQuery.offset) || 0;
    const query = ctx.inlineQuery.query.trim();

    if (!query) {
      debug('Empty query');
      return ctx.answerInlineQuery([], {
        cache_time: cacheTime,
      });
    }

    debug('Searching for: %s', query);
    const results = await googleSearch(query, offset);
    debug('Done searching for: %s', query);

    if (offset === 0 && results.length === 0) {
      debug('Nothing was found for: %s', query);
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
          // if search didn't give a result, then there is no more results
          next_offset: results.length ? resultsPerPage + offset : '',
          cache_time: cacheTime,
        },
      );
    }

    const inlineResults = results.map((result, i) => {
      return {
        type: 'article',
        id: i,
        title: result.title,
        input_message_content: {
          message_text:
            '**' + markdownEscape(result.title) + '**' + '\n' + result.href,
          parse_mode: 'Markdown',
        },
        description: result.description || '',
      };
    });

    debug('Answering to inline query "%s"', query);

    return ctx.answerInlineQuery(inlineResults, {
      // if search didn't give a result, then there is no more results
      next_offset: results.length ? resultsPerPage + offset : '',
      cache_time: 86400, // one day
    });
  } catch (err) {
    debug('Error: %O', err);
    logger.error({ error: err });
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
};
