import { IFile, IUploadProgressHandler } from '~/redux/types';
import { UploadTarget, UploadType } from '~/constants/uploads';

export type ApiUploadFileRequest = {
  file: File;
  type: UploadType;
  target: UploadTarget;
  onProgress: IUploadProgressHandler;
};

export type ApiUploadFIleResult = IFile;
