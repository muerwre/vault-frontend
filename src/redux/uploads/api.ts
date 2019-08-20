import {
 IResultWithStatus, IFile, IUploadProgressHandler, IFileWithUUID,
} from '~/redux/types';
import { api, configWithToken } from '~/utils/api';
import { API } from '~/constants/api';

export const postUploadFile = ({
  access,
  file,
  target = 'others',
  type = 'image',
}: IFileWithUUID & {
  access: string;
  onProgress: IUploadProgressHandler;
}): Promise<IResultWithStatus<IFile>> => {
  const data = new FormData();
  data.append('file', file);

  return api.post(API.USER.UPLOAD(target, type), data, configWithToken(access));
};
