import { ContextMessageUpdate } from 'telegraf';
import Extra from 'telegraf/extra';
import _debug from 'debug';
const debug = _debug('app:bot:commands');

const markup = Extra.markdown();

export async function helpCommandHandler(
  ctx: AdditionalKeys<ContextMessageUpdate>,
): Promise<void> {
  debug('/help user: %s', ctx.from.username);
  await ctx.reply(
    'Type `@' +
      ctx.botInfo.username +
      ' funny cats` and you will see search result.\n' +
      'Then click on them to send to me!',
    markup,
  );
  return;
}
