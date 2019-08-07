import { IFile } from "~/redux/types";
import { IUploadState, IUploadStatus } from "./reducer";

const prefix = 'UPLOAD.';

export const UPLOAD_ACTIONS = {
  UPLOAD_FILES: `${prefix}UPLOAD_FILES`,
  UPLOAD_CANCEL: `${prefix}UPLOAD_CANCEL`,

  ADD_STATUS: `${prefix}ADD_STATUS`,
  DROP_STATUS: `${prefix}DROP_STATUS`,
  SET_STATUS: `${prefix}SET_STATUS`,

  ADD_FILE: `${prefix}ADD_FILE`,
};

export const EMPTY_FILE: IFile = {
  id: null,
  user_id: null,
  node_id: null,

  name: 'somefile.jpg',
  path: '/covers/',
  full_path: '/covers/somefile.jpg',
  size: 2400000,
  type: 'image',
  mime: 'image/jpeg',
};

export const EMPTY_UPLOAD_STATUS: IUploadStatus = {
  is_uploading: false,
  preview: null,
  error: null,
  uuid: null,
  url: null,
  progress: 0,
  thumbnail_url: null,
  type: null,
}