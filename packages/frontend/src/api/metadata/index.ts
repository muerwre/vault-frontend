import { ApiGetEmbedYoutubeResult } from '~/api/metadata/types';
import { API } from '~/constants/api';
import { api, unwrap } from '~/utils/api';

export const apiGetEmbedYoutube = (ids: string[]) =>
  api
    .get<ApiGetEmbedYoutubeResult>(API.EMBED.YOUTUBE, {
      params: { ids: ids.join(',') },
    })
    .then(unwrap);
