
import { ApiUploadFileRequest, ApiUploadFIleResult } from '~/api/uploads/types';
import { API } from '~/constants/api';
import { UploadTarget, UploadType } from '~/constants/uploads';
import { api, cleanResult } from '~/utils/api';

export const apiUploadFile = ({
  file,
  target = UploadTarget.Others,
  type = UploadType.Image,
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
