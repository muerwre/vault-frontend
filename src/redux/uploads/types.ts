import { IFile, IFileWithUUID, IUploadProgressHandler } from '~/redux/types';

export type ApiUploadFileRequest = IFileWithUUID & {
  onProgress: IUploadProgressHandler;
};
export type ApiUploadFIleResult = IFile;
