import React, { createContext, FC, useContext } from 'react';
import { useUploader } from '~/hooks/data/useUploader';
import { IFile } from '~/types';
import { EMPTY_FILE } from '~/constants/uploads';

export type Uploader = ReturnType<typeof useUploader>;

const UploaderContext = createContext<Uploader>({
  files: [],
  filesAudios: [],
  filesImages: [],
  uploadFile: async () => EMPTY_FILE,
  uploadFiles: async () => {},
  pending: {},
  pendingAudios: [],
  pendingImages: [],
  isUploading: false,
  setFiles: (files: IFile[]) => files,
});

export const UploaderContextProvider: FC<{
  value: Uploader;
  children;
}> = ({ value, children }) => (
  <UploaderContext.Provider value={value}>{children}</UploaderContext.Provider>
);

export const useUploaderContext = () => useContext(UploaderContext);
