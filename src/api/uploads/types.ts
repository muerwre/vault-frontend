import { UploadTarget, UploadType } from '~/constants/uploads';
import { IFile, IUploadProgressHandler } from '~/types';

export type ApiUploadFileRequest = {
  file: File;
  type: UploadType;
  target: UploadTarget;
  onProgress: IUploadProgressHandler;
};

export type ApiUploadFIleResult = IFile;
