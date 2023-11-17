import { API } from '~/constants/api';
import {
  GetLabNodesRequest,
  GetLabNodesResult,
  GetLabStatsResult,
  GetLabUpdatesResult,
} from '~/types/lab';
import { api, unwrap } from '~/utils/api';

export const getLabNodes = ({
  offset,
  limit,
  sort,
  search,
}: GetLabNodesRequest) =>
  api
    .get<GetLabNodesResult>(API.LAB.NODES, {
      params: { offset, limit, sort, search },
    })
    .then(unwrap);

export const getLabStats = () =>
  api.get<GetLabStatsResult>(API.LAB.STATS).then(unwrap);
export const getLabUpdates = () =>
  api.get<GetLabUpdatesResult>(API.LAB.UPDATES).then(unwrap);
