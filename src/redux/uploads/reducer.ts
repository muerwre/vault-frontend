import { createReducer } from '~/utils/reducer';
import { IFile, UUID } from '~/redux/types';
import { UPLOAD_HANDLERS } from './handlers';

export interface IUploadStatus {
  is_uploading: boolean;
  error: string;
  preview: string;
  uuid: IFile['id'];
  url: string;
  type: string;
  thumbnail_url: string;
  progress: number;
  temp_id: UUID;
  name: string;
}

export interface IUploadState {
  files: Record<UUID, IFile>;
  statuses: Record<UUID, IUploadStatus>;
}

const INITIAL_STATE = {
  files: {},
  statuses: {},
};

export default createReducer(INITIAL_STATE, UPLOAD_HANDLERS);
