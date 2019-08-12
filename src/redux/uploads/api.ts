import { IResultWithStatus, IFile } from '~/redux/types';
import { api, configWithToken } from '~/utils/api';
import { API } from '~/constants/api';

export const postUploadFile = ({
  access,
  file,
  target = 'others',
  type = 'image',
}: {
access: string;
file: File;
target: string;
type: string;
}): Promise<IResultWithStatus<IFile>> => {
  const data = new FormData();
  data.append('file', file);

  return api.post(API.USER.UPLOAD(target, type), data, configWithToken(access));
};
