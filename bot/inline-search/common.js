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
