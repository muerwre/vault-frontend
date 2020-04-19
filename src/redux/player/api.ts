import { IResultWithStatus, IEmbed } from '../types';
import { api, resultMiddleware, errorMiddleware } from '~/utils/api';
import { API } from '~/constants/api';

export const getEmbedYoutube = (
  ids: string[]
): Promise<IResultWithStatus<{ items: Record<string, IEmbed> }>> =>
  api
    .get(API.EMBED.YOUTUBE, { params: { ids: ids.join(',') } })
    .then(resultMiddleware)
    .catch(errorMiddleware);
