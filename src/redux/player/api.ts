import { api, cleanResult } from '~/utils/api';
import { API } from '~/constants/api';
import { ApiGetEmbedYoutubeResult } from '~/redux/player/types';

export const getEmbedYoutube = (ids: string[]) =>
  api
    .get<ApiGetEmbedYoutubeResult>(API.EMBED.YOUTUBE, { params: { ids: ids.join(',') } })
    .then(cleanResult);
