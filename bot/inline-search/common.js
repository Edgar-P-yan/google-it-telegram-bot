/**
 * Used to notify, when inline search operation
 * didn't give any result.
 * @public
 * @param {Object} ctx Request context
 * @param {Number} cacheTime Seconds that telegram will cache this "Nothing found" response for this query for.
 */
module.exports.sendNothingFound = async function sendNothingFound(
  ctx,
  cacheTime,
) {
  return await ctx.answerInlineQuery(
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
};

/**
 * Used to notify, when error ocurred
 * @public
 * @param {Object} ctx Request context
 */
module.exports.sendErrorResult = async function sendErrorResult(ctx) {
  return await ctx.answerInlineQuery([
    {
      type: 'article',
      id: '0',
      title: 'We are sorry 😥. Error ocurred.',
      input_message_content: {
        message_text: 'We are sorry 😥. Error ocurred.',
      },
    },
  ]);
};
