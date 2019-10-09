import { IFile, IUploadType } from '~/redux/types';
import { IUploadState, IUploadStatus } from './reducer';

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

  name: 'mario-collage-800x450.jpg',
  path: '/wp-content/uploads/2017/09/',
  full_path: '/wp-content/uploads/2017/09/mario-collage-800x450.jpg',
  url: 'https://cdn.arstechnica.net/wp-content/uploads/2017/09/mario-collage-800x450.jpg',
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
  temp_id: null,
};

// for targeted cancellation
export const UPLOAD_SUBJECTS = {
  EDITOR: 'editor',
  COMMENT: 'comment',
  AVATAR: 'avatar',
};

export const UPLOAD_TARGETS = {
  NODES: 'nodes',
  COMMENTS: 'comments',
  PROFILES: 'profiles',
  OTHER: 'other',
};

export const UPLOAD_TYPES: Record<string, IUploadType> = {
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  OTHER: 'other',
};

export const FILE_MIMES = {
  [UPLOAD_TYPES.image]: ['image/jpeg', 'image/jpg', 'image/png'],
  [UPLOAD_TYPES.audio]: ['audio/mpeg3', 'audio/mpeg', 'audio/mp3'],
};
