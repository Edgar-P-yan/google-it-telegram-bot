import { ContextMessageUpdate } from 'telegraf';

/**
 * Used to notify, when inline search operation
 * didn't give any result.
 * @public
 * @param {ContextMessageUpdate} ctx Request context
 * @param {Number} cacheTime Seconds that telegram will cache this "Nothing found" response for this query for.
 */
export async function sendNothingFound(
  ctx: ContextMessageUpdate,
  cacheTime: number,
): Promise<void> {
  await ctx.answerInlineQuery(
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
  return;
}

/**
 * Used to notify, when error ocurred
 * @public
 * @param {ContextMessageUpdate} ctx Request context
 */
export async function sendErrorResult(
  ctx: ContextMessageUpdate,
): Promise<void> {
  await ctx.answerInlineQuery([
    {
      type: 'article',
      id: '0',
      title: 'We are sorry 😥. Error ocurred.',
      input_message_content: {
        message_text: 'We are sorry 😥. Error ocurred.',
      },
    },
  ]);
  return;
}
