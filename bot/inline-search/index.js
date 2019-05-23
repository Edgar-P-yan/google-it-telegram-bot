const debug = require('debug')('main:bot:inline-search');
const logger = require('./../../logger');
const { sendErrorResult } = require('./common');

const googleSearch = require('./google-search');
const imagesSearch = require('./images-search');
const videosSearch = require('./videos-search');

module.exports = async ctx => {
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
    return sendErrorResult(ctx);
  }
};

function _formatQuery(ctx) {
  let query = ctx.inlineQuery.query.trim();
  let queryType = null; // "images" | "videos" | "search"

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
