import { UPLOAD_ACTIONS } from '~/redux/uploads/constants';
import { IFileWithUUID, UUID, IFile } from '../types';
import { IUploadStatus } from './reducer';

export const uploadUploadFiles = (files: IFileWithUUID[]) => ({
  files,
  type: UPLOAD_ACTIONS.UPLOAD_FILES,
});

export const uploadAddStatus = (temp_id: UUID, status?: Partial<IUploadStatus>) => ({
  temp_id,
  status,
  type: UPLOAD_ACTIONS.ADD_STATUS,
});

export const uploadAddFile = (file: IFile) => ({
  file,
  type: UPLOAD_ACTIONS.ADD_FILE,
});

export const uploadSetStatus = (temp_id: UUID, status?: Partial<IUploadStatus>) => ({
  temp_id,
  status,
  type: UPLOAD_ACTIONS.SET_STATUS,
});

export const uploadDropStatus = (temp_id: UUID) => ({
  temp_id,
  type: UPLOAD_ACTIONS.DROP_STATUS,
});
