import {
 IResultWithStatus, IFile, IUploadProgressHandler, IFileWithUUID,
} from '~/redux/types';
import {
 api, configWithToken, resultMiddleware, errorMiddleware,
} from '~/utils/api';

import { API } from '~/constants/api';

export const postUploadFile = ({
  access,
  file,
  target = 'others',
  type = 'image',
  onProgress,
}: IFileWithUUID & {
  access: string;
  onProgress: IUploadProgressHandler;
}): Promise<IResultWithStatus<IFile>> => {
  const data = new FormData();
  data.append('file', file);

  return api
    .post(
      API.USER.UPLOAD(target, type),
      data,
      configWithToken(access, { onUploadProgress: onProgress })
    )
    .then(resultMiddleware)
    .catch(errorMiddleware);
};
