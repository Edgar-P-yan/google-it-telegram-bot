import { ContextMessageUpdate } from 'telegraf';

export class NothingFoundResponse {
  /**
   * Used to notify, when inline search operation
   * didn't give any result.
   * @public
   * @param {ContextMessageUpdate} ctx Request context
   * @param {Number} cacheTime Seconds that telegram will cache this "Nothing found"
   *  response for this query for.
   */
  public async send(
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
  }
}
