// tslint:disable no-unused-expression
import 'reflect-metadata';
import { ConfigService } from '../src/services/config';
import { expect } from 'chai';

describe('ConfigService', () => {
  describe('#constructor', () => {
    it('constructs', () => {
      new ConfigService({
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
        new ConfigService({
          GCS_ENGINE_ID: '****',
          GOOGLE_API_KEY: '****',
          WEB_HOOKS: 'false',
        });
      }).to.throw('BOT_TOKEN');
    });

    it('transforms configs', () => {
      const config = new ConfigService({
        BOT_TOKEN: '****',
        GCS_ENGINE_ID: '****',
        GOOGLE_API_KEY: '****',
        WEB_HOOKS: 'false',
      });

      expect(config.config.WEB_HOOKS).to.be.false;
    });
  });

  describe('#get', () => {
    it('gets config', () => {
      const config = new ConfigService({
        BOT_TOKEN: '****',
        GCS_ENGINE_ID: '****',
        GOOGLE_API_KEY: '****',
        WEB_HOOKS: 'false',
      });

      expect(config.get('BOT_TOKEN')).to.be.equal('****');
    });
  });
});
