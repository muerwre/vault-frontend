import {
  ApiGetNotesRequest,
  ApiGetNotesResponse,
  ApiPostNoteRequest,
  ApiPostNoteResponse,
} from "~/api/notes/types";
import { URLS } from "~/constants/urls";
import { api, cleanResult } from "~/utils/api";

export const apiGetNotes = ({ limit, offset, search }: ApiGetNotesRequest) =>
  api
    .get<ApiGetNotesResponse>(URLS.NOTES, { params: { limit, offset, search } })
    .then(cleanResult);

export const apiPostNote = ({ text }: ApiPostNoteRequest) =>
  api
    .post<ApiPostNoteResponse>(URLS.NOTES, {
      text,
    })
    .then(cleanResult);
