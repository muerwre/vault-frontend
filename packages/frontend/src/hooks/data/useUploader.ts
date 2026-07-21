import { useCallback } from 'react';

import { useLocalObservable } from 'mobx-react-lite';
import uuid from 'uuid4';

import { apiUploadFile } from '~/api/uploads';
import { UploadSubject, UploadTarget } from '~/constants/uploads';
import { UploaderStore } from '~/store/uploader/UploaderStore';
import { IFile } from '~/types';
import { showErrorToast } from '~/utils/errors/showToast';
import { keys } from '~/utils/ramda';

export const useUploader = (
  subject: UploadSubject,
  target: UploadTarget,
  initialFiles?: IFile[],
) => {
  const store = useLocalObservable(() => new UploaderStore(initialFiles));

  const uploadFile = useCallback(
    async (file: File) => {
      const id = uuid();

      try {
        // TODO: pass CancelationToken for axios as cancel() to pending
        // TODO: cancel all uploads on unmount

        const pending = await store.addPending(id, file);
        const onProgress = ({ loaded, total }) =>
          store.updateProgress(id, loaded, total);
        const result = await apiUploadFile({
          file,
          target,
          type: pending.type,
          onProgress,
        });

        store.removePending(id);
        store.addFile(result);

        return result;
      } catch (error) {
        store.removePending(id);
        showErrorToast(error);
      }
    },
    [store, target],
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      await Promise.any(files.map((file) => uploadFile(file)));
    },
    [uploadFile],
  );

  const isUploading = keys(store.pending).length > 0;

  return {
    uploadFile,
    uploadFiles,
    files: store.files,
    filesImages: store.filesImages,
    filesAudios: store.filesAudios,
    pending: store.pending,
    pendingImages: store.pendingImages,
    pendingAudios: store.pendingAudios,
    isUploading,
    setFiles: store.setFiles,
    setImages: store.setImages,
    setAudios: store.setAudios,
  };
};
