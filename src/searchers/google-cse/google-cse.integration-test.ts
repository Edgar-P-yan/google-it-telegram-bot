import { GoogleCSE } from './google-cse';
import { IntegrationConfigs } from '../../integration-test-helpers/integration-configs';
import { expect } from 'chai';

describe('Integration:GoogleCSE', () => {
  const configs = new IntegrationConfigs();

  describe('#search', () => {
    it('returns some results', async () => {
      const cse = new GoogleCSE({
        gcsEngineId: configs.get('GCS_ENGINE_ID'),
        googleApiKey: configs.get('GOOGLE_API_KEY'),
      });

      const result = await cse.search({
        q: 'what is oop?',
      });

      expect(result).to.be.an('array');
      result.forEach((item) => {
        expect(item.title).to.be.a('string');
        expect(item.title.length).be.greaterThan(3);
      });
    });
  });
});
