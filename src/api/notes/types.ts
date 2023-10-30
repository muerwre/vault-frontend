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

export interface ApiCreateNoteRequest {
  text: string;
}

export interface ApiUpdateNoteResponse extends Note {}

export interface ApiUpdateNoteRequest {
  id: number;
  text: string;
}
