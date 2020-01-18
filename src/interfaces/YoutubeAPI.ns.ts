import { youtube_v3 } from 'googleapis';

export namespace NSYoutubeAPI {
  export interface IService {
    search(params: IParams): Promise<youtube_v3.Schema$SearchListResponse>;
  }

  export interface IParams
    extends Pick<
      youtube_v3.Params$Resource$Search$List,
      'q' | 'relevanceLanguage' | 'pageToken'
    > {}
}
