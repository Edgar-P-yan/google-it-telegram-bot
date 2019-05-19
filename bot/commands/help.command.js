const Extra = require('telegraf/extra');

const markup = Extra.markdown();

module.exports = ctx => {
  return ctx.reply(
    'Type `@' +
      ctx.botInfo.username +
      ' funny cats` and you will see search result.\n' +
      'Then click on them to send to me!',
    markup,
  );
};
