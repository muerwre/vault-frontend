import { api, cleanResult, configWithToken } from '~/utils/api';
import { INode, IResultWithStatus } from '../types';
import { API } from '~/constants/api';
import { PostCellViewRequest, PostCellViewResult } from '~/redux/node/types';
import { GetSearchResultsRequest, GetSearchResultsResult } from '~/redux/flow/types';

export const postNode = ({
  access,
  node,
}: {
  access: string;
  node: INode;
}): Promise<IResultWithStatus<INode>> =>
  api.post(API.NODE.SAVE, { node }, configWithToken(access)).then(cleanResult);

export const postCellView = ({ id, flow }: PostCellViewRequest) =>
  api
    .post<PostCellViewResult>(API.NODE.SET_CELL_VIEW(id), { flow })
    .then(cleanResult);

export const getSearchResults = ({ text, skip = 0 }: GetSearchResultsRequest) =>
  api
    .get<GetSearchResultsResult>(API.SEARCH.NODES, { params: { text, skip } })
    .then(cleanResult);
