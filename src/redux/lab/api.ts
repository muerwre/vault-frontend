import { api, cleanResult } from '~/utils/api';
import { API } from '~/constants/api';
import { GetLabNodesRequest, GetLabNodesResult } from '~/redux/lab/types';

export const getLabNodes = ({ after }: GetLabNodesRequest) =>
  api
    .get<GetLabNodesResult>(API.LAB.NODES, { params: { after } })
    .then(cleanResult);
