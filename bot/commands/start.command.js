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
      'I am an inline bot for searching *WEB*, *IMAGES*, *VIDEOS*.\n' +
      'Usage.\n\n' +
      '🔎 First of all, type `@Google_itBot `, and then type anything you' +
      'want to search. For example `@Google_itBot cats`, and it will show search results.\n' +
      '🖼️ *Wanna search images?* Just type `images` next to it. `Google_itBot cats images`.\n' +
      '🎞️ *Wanna search videos?* Just type `videos` next to it. `@Google_itBot cats videos`.\n' +
      `📤 *Wanna share the result?* Just tap on the result.\n\n` +
      "*LET'S DO THIS*. Type `@Google_itBot funny cats images` and share with me some images of them!",
    markup,
  );
};
