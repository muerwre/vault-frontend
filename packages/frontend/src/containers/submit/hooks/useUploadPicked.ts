import { ChangeEvent, useCallback } from 'react';

import { UploadType } from '~/constants/uploads';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';
import { getFileType } from '~/utils/uploader';

/**
 * A file input's change handler that uploads the picked files of one type
 * through the page's uploader, ignoring any others.
 */
export const useUploadPicked = (type: UploadType) => {
  const { uploadFiles } = useUploaderContext()!;

  return useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []).filter(
        (file) => getFileType(file) === type,
      );

      // Cleared so picking the same files again still fires a change.
      event.target.value = '';

      if (files.length) {
        void uploadFiles(files);
      }
    },
    [type, uploadFiles],
  );
};
