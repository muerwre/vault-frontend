import {
  ApiGetNotesRequest as ApiListNotesRequest,
  ApiGetNotesResponse,
  ApiCreateNoteRequest,
  ApiUpdateNoteResponse,
  ApiUpdateNoteRequest,
} from '~/api/notes/types';
import { URLS } from '~/constants/urls';
import { api, cleanResult } from '~/utils/api';

export const apiListNotes = ({ limit, offset, search }: ApiListNotesRequest) =>
  api
    .get<ApiGetNotesResponse>(URLS.NOTES, { params: { limit, offset, search } })
    .then(cleanResult);

export const apiCreateNote = ({ text }: ApiCreateNoteRequest) =>
  api
    .post<ApiUpdateNoteResponse>(URLS.NOTES, {
      text,
    })
    .then(cleanResult);

export const apiDeleteNote = (id: number) =>
  api.delete(URLS.NOTE(id)).then(cleanResult);

export const apiUpdateNote = ({ id, text }: ApiUpdateNoteRequest) =>
  api
    .put<ApiUpdateNoteResponse>(URLS.NOTE(id), {
      content: text,
    })
    .then(cleanResult);
