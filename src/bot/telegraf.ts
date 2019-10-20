import Telegraf from 'telegraf';
import SocksProxyAgent from 'socks-proxy-agent' 
import * as config from './../config'

export function makeTelegrafBot() {
  const bot = new Telegraf(config.get('BOT_TOKEN'), {
    telegram: {
      agent:
        (config.get('SOCKS_PROXY') && 
          new SocksProxyAgent(config.get('SOCKS_PROXY'))) || null,
    },
  });

  return bot;
};
