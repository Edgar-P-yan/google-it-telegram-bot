import {logger} from './../logger' 
import noDirectRequestsInGroups from './middlewares/no-direct-requests-in-groups'
import {startCommandHandler} from './commands/start.command'
import {helpCommandHandler} from './commands/help.command'
import {inlineSearchHandler} from './inline-search'
import {makeTelegrafBot} from './telegraf';
import _debug from 'debug';
const debug = _debug('app:bot');

export const bot = makeTelegrafBot();

bot.catch((err: any) => {
  debug(err);
  logger.error({ error: err });
});

bot.use(noDirectRequestsInGroups);

bot.start(startCommandHandler);
bot.help(helpCommandHandler);
bot.on('inline_query', inlineSearchHandler);
