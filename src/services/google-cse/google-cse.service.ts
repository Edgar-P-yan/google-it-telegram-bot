import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';
import { google, customsearch_v1 } from 'googleapis';
import { NSGoogleCSE, NSConfig } from '../../interfaces';
import _ from 'lodash';

/**
 * Google Custom Search Engine Service
 */
@injectable()
export class GoogleCSEService implements NSGoogleCSE.IService {
  private readonly customSearch: customsearch_v1.Customsearch;
  private readonly RESULTS_PER_PAGE = 10;

  constructor(
    @inject(TYPES.Config)
    private readonly config: NSConfig.IService,
  ) {
    this.customSearch = google.customsearch('v1');
  }

  public async search(
    params: NSGoogleCSE.ISearchParams,
  ): Promise<customsearch_v1.Schema$Result[]> {
    const res = await this.customSearch.cse.list({
      cx: this.config.get('GCS_ENGINE_ID'),
      auth: this.config.get('GOOGLE_API_KEY'),
      fields: 'items(title,link,snippet,pagemap(cse_thumbnail,cse_image))',
      ...params,
    });

    return _.get(res, ['data', 'items']) || [];
  }

  public async searchImages(
    params: NSGoogleCSE.IImageSearchParams,
  ): Promise<customsearch_v1.Schema$Result[]> {
    const res = await this.customSearch.cse.list({
      cx: this.config.get('GCS_ENGINE_ID'),
      auth: this.config.get('GOOGLE_API_KEY'),
      num: this.RESULTS_PER_PAGE,
      searchType: 'image',
      fileType: 'jpeg',
      fields: 'items(link,image(width,height,thumbnailLink),title)',
      ...params,
    });

    return _.get(res, ['data', 'items']) || [];
  }
}
