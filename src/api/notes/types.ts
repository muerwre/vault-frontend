import { Note } from '~/types/notes';

export interface ApiGetNotesRequest {
  limit: number;
  offset: number;
  search: string;
}

export interface ApiGetNotesResponse {
  list: Note[];
  totalCount: number;
}
