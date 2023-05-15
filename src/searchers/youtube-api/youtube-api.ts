import { google, youtube_v3 } from 'googleapis';

export type SearchParams = Pick<
  youtube_v3.Params$Resource$Search$List,
  'q' | 'relevanceLanguage' | 'pageToken'
>;

export interface YoutubeAPIParams {
  googleApiKey: string;
}

export class YoutubeAPI {
  private youtube: youtube_v3.Youtube;
  constructor(private readonly params: YoutubeAPIParams) {
    this.youtube = google.youtube('v3');
  }

  async search(
    params: SearchParams,
  ): Promise<youtube_v3.Schema$SearchListResponse> {
    const res = await this.youtube.search.list({
      part: 'snippet',
      maxResults: 20,
      type: 'video',
      videoEmbeddable: 'true',
      key: this.params.googleApiKey,
      fields:
        'items(id/videoId,snippet(channelTitle,thumbnails/default/url,title)),nextPageToken',
      ...params,
    });

    return res.data;
  }
}
