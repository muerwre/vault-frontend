import { api, cleanResult } from '~/utils/api';
import { API } from '~/constants/api';
import { ApiGetEmbedYoutubeResult } from '~/api/metadata/types';

export const apiGetEmbedYoutube = (ids: string[]) =>
  api
    .get<ApiGetEmbedYoutubeResult>(API.EMBED.YOUTUBE, { params: { ids: ids.join(',') } })
    .then(cleanResult);
