import { API } from '~/constants/api';
import {
  GetLabNodesRequest,
  GetLabNodesResult,
  GetLabStatsResult,
  GetLabUpdatesResult,
} from '~/types/lab';
import { api, cleanResult } from '~/utils/api';

export const getLabNodes = ({ after, sort }: GetLabNodesRequest) =>
  api
    .get<GetLabNodesResult>(API.LAB.NODES, { params: { after, sort } })
    .then(cleanResult);

export const getLabStats = () => api.get<GetLabStatsResult>(API.LAB.STATS).then(cleanResult);
export const getLabUpdates = () => api.get<GetLabUpdatesResult>(API.LAB.UPDATES).then(cleanResult);
