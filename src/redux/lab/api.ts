import { api, cleanResult } from '~/utils/api';
import { API } from '~/constants/api';
import { GetLabNodesRequest, GetLabNodesResult, GetLabStatsResult } from '~/redux/lab/types';

export const getLabNodes = ({ after }: GetLabNodesRequest) =>
  api
    .get<GetLabNodesResult>(API.LAB.NODES, { params: { after } })
    .then(cleanResult);

export const getLabStats = () => api.get<GetLabStatsResult>(API.LAB.STATS).then(cleanResult);
