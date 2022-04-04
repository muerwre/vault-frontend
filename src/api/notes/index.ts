import { ApiGetNotesRequest, ApiGetNotesResponse } from '~/api/notes/types';
import { URLS } from '~/constants/urls';
import { api, cleanResult } from '~/utils/api';

export const apiGetNotes = ({ limit, offset, search }: ApiGetNotesRequest) =>
  api
    .get<ApiGetNotesResponse>(URLS.NOTES, { params: { limit, offset, search } })
    .then(cleanResult);
