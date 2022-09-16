import { API } from '~/constants/api';
import { GetSearchResultsRequest, GetSearchResultsResult } from '~/types/flow';
import { PostCellViewRequest, PostCellViewResult } from '~/types/node';
import { api, cleanResult } from '~/utils/api';

export const postCellView = ({ id, flow }: PostCellViewRequest) =>
  api
    .post<PostCellViewResult>(API.NODES.SET_CELL_VIEW(id), { flow })
    .then(cleanResult);

export const getSearchResults = ({
  text,
  skip,
  take,
}: GetSearchResultsRequest) =>
  api
    .get<GetSearchResultsResult>(API.SEARCH.NODES, {
      params: { text, skip, take },
    })
    .then(cleanResult);
