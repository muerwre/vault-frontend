import { API } from '~/constants/api';
import { GetSearchResultsRequest, GetSearchResultsResult } from '~/types/flow';
import {
  PostCellViewRequest,
  PostCellViewResult,
  PostProfileCellViewRequest,
  PostProfileCellViewResult,
} from '~/types/node';
import { api, unwrap } from '~/utils/api';

export const postCellView = ({ id, flow }: PostCellViewRequest) =>
  api
    .post<PostCellViewResult>(API.NODES.SET_CELL_VIEW(id), { flow })
    .then(unwrap);

export const postProfileCellView = ({ id, flow }: PostProfileCellViewRequest) =>
  api
    .post<PostProfileCellViewResult>(API.NODES.SET_PROFILE_CELL_VIEW(id), {
      flow,
    })
    .then(unwrap);

export const getSearchResults = ({
  text,
  skip,
  take,
}: GetSearchResultsRequest) =>
  api
    .get<GetSearchResultsResult>(API.SEARCH.NODES, {
      params: { text, skip, take },
    })
    .then(unwrap);
