import { api, cleanResult } from '~/utils/api';
import { API } from '~/constants/api';
import {
  GetLabNodesRequest,
  GetLabNodesResult,
  GetLabStatsResult,
  GetLabUpdatesResult,
} from '~/types/lab';

export const getLabNodes = ({ after }: GetLabNodesRequest) =>
  api
    .get<GetLabNodesResult>(API.LAB.NODES, { params: { after } })
    .then(cleanResult);

export const getLabStats = () => api.get<GetLabStatsResult>(API.LAB.STATS).then(cleanResult);
export const getLabUpdates = () => api.get<GetLabUpdatesResult>(API.LAB.UPDATES).then(cleanResult);
