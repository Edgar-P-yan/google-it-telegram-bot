import { customsearch_v1 } from 'googleapis';

export namespace NSGoogleCSE {
  export interface IService {
    search(params: ISearchParams): Promise<customsearch_v1.Schema$Result[]>;

    searchImages(
      params: IImageSearchParams,
    ): Promise<customsearch_v1.Schema$Result[]>;
  }

  export interface IImageSearchParams
    extends Pick<
      customsearch_v1.Params$Resource$Cse$List,
      'q' | 'hl' | 'start' | 'num'
    > {}

  export interface ISearchParams
    extends Pick<
      customsearch_v1.Params$Resource$Cse$List,
      'q' | 'hl' | 'start' | 'num'
    > {}
}
