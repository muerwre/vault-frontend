import { api, cleanResult } from '~/utils/api';

import { API } from '~/constants/api';
import { ApiUploadFileRequest, ApiUploadFIleResult } from '~/redux/uploads/types';

export const apiUploadFile = ({
  file,
  target = 'others',
  type = 'image',
  onProgress,
}: ApiUploadFileRequest) => {
  const data = new FormData();
  data.append('file', file);

  return api
    .post<ApiUploadFIleResult>(API.USER.UPLOAD(target, type), data, {
      onUploadProgress: onProgress,
    })
    .then(cleanResult);
};
