import { ContextMessageUpdate } from 'telegraf';

export class UnknownErrorResponse {
  /**
   * Used to notify, when error ocurred
   * @public
   * @param {ContextMessageUpdate} ctx Request context
   */
  public async send(ctx: ContextMessageUpdate): Promise<void> {
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
  }
}
