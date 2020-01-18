import { injectable, inject } from 'inversify';
import { NSConfig, NSYoutubeAPI } from '../../interfaces';
import { TYPES } from '../../types';
import { google, youtube_v3 } from 'googleapis';
import _ from 'lodash';

@injectable()
export class YoutubeAPI implements NSYoutubeAPI.IService {
  private youtube: youtube_v3.Youtube;
  constructor(
    @inject(TYPES.Config)
    private readonly config: NSConfig.IService,
  ) {
    this.youtube = google.youtube('v3');
  }

  async search(
    params: NSYoutubeAPI.IParams,
  ): Promise<youtube_v3.Schema$SearchListResponse> {
    const res = await this.youtube.search.list({
      part: 'snippet',
      maxResults: 20,
      type: 'video',
      videoEmbeddable: 'true',
      key: this.config.get('GOOGLE_API_KEY'),
      fields:
        'items(id/videoId,snippet(channelTitle,thumbnails/default/url,title)),nextPageToken',
      ...params,
    });

    return res.data;
  }
}
