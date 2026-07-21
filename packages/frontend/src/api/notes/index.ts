import {
  ApiGetNotesRequest as ApiListNotesRequest,
  ApiGetNotesResponse,
  ApiCreateNoteRequest,
  ApiUpdateNoteResponse,
  ApiUpdateNoteRequest,
} from '~/api/notes/types';
import { URLS } from '~/constants/urls';
import { api, unwrap } from '~/utils/api';

export const apiListNotes = ({ limit, offset, search }: ApiListNotesRequest) =>
  api
    .get<ApiGetNotesResponse>(URLS.NOTES, { params: { limit, offset, search } })
    .then(unwrap);

export const apiCreateNote = ({ text }: ApiCreateNoteRequest) =>
  api
    .post<ApiUpdateNoteResponse>(URLS.NOTES, {
      text,
    })
    .then(unwrap);

export const apiDeleteNote = (id: number) =>
  api.delete(URLS.NOTE(id)).then(unwrap);

export const apiUpdateNote = ({ id, text }: ApiUpdateNoteRequest) =>
  api
    .put<ApiUpdateNoteResponse>(URLS.NOTE(id), {
      content: text,
    })
    .then(unwrap);
