import { IntegrationConfigs } from '../../integration-test-helpers/integration-configs';
import { expect } from 'chai';
import { YoutubeAPI } from './youtube-api';

describe('Integration:YouTubeAPI', () => {
  const configs = new IntegrationConfigs();

  describe('#search', () => {
    it('returns some results', async () => {
      const cse = new YoutubeAPI({
        googleApiKey: configs.get('GOOGLE_API_KEY'),
      });

      const result = await cse.search({
        q: 'what is oop?',
      });

      expect(result.items).to.be.an('array');
      result.items.forEach((item) => {
        expect(item.snippet.title).to.be.a('string');
        expect(item.snippet.title.length).be.greaterThan(3);
      });
    });
  });
});
