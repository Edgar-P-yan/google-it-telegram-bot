import Telegraf from 'telegraf';
import SocksProxyAgent from 'socks-proxy-agent' 

export function makeTelegrafBot() {
  const bot = new Telegraf(process.env.BOT_TOKEN, {
    telegram: {
      agent:
        (process.env.SOCKS_PROXY && 
          new SocksProxyAgent(process.env.SOCKS_PROXY)) || null,
    },
  });

  return bot;
};
