import { IFile } from '~/redux/types';

export const EMPTY_FILE: IFile = {
  id: undefined,
  user_id: undefined,
  node_id: undefined,

  name: '',
  orig_name: '',
  path: '',
  full_path: '',
  url: '',
  size: 0,
  type: undefined,
  mime: '',
};

// for targeted cancellation
export enum UploadSubject {
  Editor = 'editor',
  Comment = 'comment',
  Avatar = 'avatar',
}

export enum UploadTarget {
  Nodes = 'nodes',
  Comments = 'comments',
  Profiles = 'profiles',
  Others = 'other',
}

export enum UploadType {
  Image = 'image',
  Audio = 'audio',
  Video = 'video',
  Other = 'other',
}

export const FILE_MIMES: Record<UploadType, string[]> = {
  [UploadType.Video]: [],
  [UploadType.Image]: ['image/jpeg', 'image/jpg', 'image/png'],
  [UploadType.Audio]: ['audio/mpeg3', 'audio/mpeg', 'audio/mp3'],
  [UploadType.Other]: [],
};

export const COMMENT_FILE_TYPES = [
  ...FILE_MIMES[UploadType.Image],
  ...FILE_MIMES[UploadType.Audio],
];

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
