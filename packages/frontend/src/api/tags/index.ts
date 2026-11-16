import { API } from '~/constants/api';
import {
  ApiGetNodesOfTagRequest,
  ApiGetNodesOfTagResult,
  ApiGetTagSuggestionsRequest,
  ApiGetTagSuggestionsResult,
} from '~/types/tags';
import { api, unwrap } from '~/utils/api';

export const apiGetNodesOfTag = ({
  tag,
  offset,
  limit,
  lab,
}: ApiGetNodesOfTagRequest) =>
  api
    .get<ApiGetNodesOfTagResult>(API.TAG.NODES, {
      params: { name: tag, offset, limit, feature: lab ? 'lab' : undefined },
    })
    .then(unwrap);

export const apiGetTagSuggestions = ({
  search,
  exclude,
}: ApiGetTagSuggestionsRequest) =>
  api
    .get<ApiGetTagSuggestionsResult>(API.TAG.AUTOCOMPLETE, {
      params: { search, exclude },
    })
    .then(unwrap);
