import { API } from '~/constants/api';
import {
  ApiGetNodesOfTagRequest,
  ApiGetNodesOfTagResult,
  ApiGetTagSuggestionsRequest,
  ApiGetTagSuggestionsResult,
} from '~/types/tags';
import { api, cleanResult } from '~/utils/api';

export const apiGetNodesOfTag = ({ tag, offset, limit }: ApiGetNodesOfTagRequest) =>
  api
    .get<ApiGetNodesOfTagResult>(API.TAG.NODES, { params: { name: tag, offset, limit } })
    .then(cleanResult);

export const apiGetTagSuggestions = ({ search, exclude }: ApiGetTagSuggestionsRequest) =>
  api
    .get<ApiGetTagSuggestionsResult>(API.TAG.AUTOCOMPLETE, { params: { search, exclude } })
    .then(cleanResult);
