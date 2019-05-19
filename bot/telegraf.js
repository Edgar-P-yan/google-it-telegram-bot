const Telegraf = require('telegraf');
const SocksProxyAgent = require('socks-proxy-agent');

module.exports = function makeTelegrafBot() {
  const bot = new Telegraf(process.env.BOT_TOKEN, {
    telegram: {
      agent:
        (process.env.SOCKS_PROXY &&
          new SocksProxyAgent(process.env.SOCKS_PROXY)) ||
        null,
    },
  });

  return bot;
};
