import { google, customsearch_v1 } from 'googleapis';
import _ from 'lodash';

export interface GoogleCSEParams {
  gcsEngineId: string;
  googleApiKey: string;
}

export type ImageSearchParams = Pick<
  customsearch_v1.Params$Resource$Cse$List,
  'q' | 'hl' | 'start' | 'num'
>;

export type SearchParams = Pick<
  customsearch_v1.Params$Resource$Cse$List,
  'q' | 'hl' | 'start' | 'num'
>;

/**
 * Google Custom Search Engine Service
 */
export class GoogleCSE {
  private readonly customSearch: customsearch_v1.Customsearch;
  private readonly RESULTS_PER_PAGE = 10;

  constructor(private readonly params: GoogleCSEParams) {
    this.customSearch = google.customsearch('v1');
  }

  public async search(
    params: SearchParams,
  ): Promise<customsearch_v1.Schema$Result[]> {
    const res = await this.customSearch.cse.list({
      cx: this.params.gcsEngineId,
      auth: this.params.googleApiKey,
      fields: 'items(title,link,snippet,pagemap(cse_thumbnail,cse_image))',
      ...params,
    });

    return _.get(res, ['data', 'items']) || [];
  }

  public async searchImages(
    params: ImageSearchParams,
  ): Promise<customsearch_v1.Schema$Result[]> {
    const res = await this.customSearch.cse.list({
      cx: this.params.gcsEngineId,
      auth: this.params.googleApiKey,
      num: this.RESULTS_PER_PAGE,
      searchType: 'image',
      fileType: 'jpeg',
      fields: 'items(link,image(width,height,thumbnailLink),title)',
      ...params,
    });

    const result = _.get(res, ['data', 'items']) || [];

    return result;
  }
}
