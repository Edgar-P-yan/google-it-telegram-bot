// tslint:disable no-unused-expression

import { expect } from 'chai';
import { ConfigsFromEnv } from './configs-from-env';

describe('ConfigsFromEnv', () => {
  describe('#constructor', () => {
    it('constructs', () => {
      new ConfigsFromEnv({
        BOT_TOKEN: '****',
        GCS_ENGINE_ID: '****',
        GOOGLE_API_KEY: '****',
        WEB_HOOKS: 'false',
      });
    });
  });

  describe('#validateConfig', () => {
    it('throw error when required configs missing', () => {
      expect(() => {
        new ConfigsFromEnv({
          GCS_ENGINE_ID: '****',
          GOOGLE_API_KEY: '****',
          WEB_HOOKS: 'false',
        });
      }).to.throw('BOT_TOKEN');
    });
  });

  describe('#get', () => {
    it('gets config', () => {
      const config = new ConfigsFromEnv({
        BOT_TOKEN: '****',
        GCS_ENGINE_ID: '****',
        GOOGLE_API_KEY: '****',
        WEB_HOOKS: 'false',
      });

      expect(config.get('BOT_TOKEN')).to.be.equal('****');
    });
  });
});
