import { IFile } from "~/redux/types";

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