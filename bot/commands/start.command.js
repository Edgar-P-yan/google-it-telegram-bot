const Extra = require('telegraf/extra');
const debug = require('debug')('bot:commands');

const markup = Extra.markdown();

module.exports = ctx => {
  debug('/start user: %s', ctx.from.username);

  return ctx.reply(
    'Hi ' +
      ctx.from.first_name +
      (ctx.from.last_name ? ' ' + ctx.from.last_name : '') +
      '! 🎉\n' +
      'This bot is an inline search engine. 👌\n' +
      'It helps to **search on Google** and **share links** in any chat or group.\n' +
      'Its pretty easy. You just start your message with `@' +
      ctx.botInfo.username +
      ' ...` and you are ready to search!\n' +
      "Let's try this out. Type `@" +
      ctx.botInfo.username +
      ' happy cats` and send me some links about them! 😻',
    markup,
  );
};
