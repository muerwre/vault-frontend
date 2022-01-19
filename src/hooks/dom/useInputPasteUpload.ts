import { useCallback } from 'react';

import { getImageFromPaste } from '~/utils/uploader';

// useInputPasteUpload attaches event listener to input, that calls onUpload if user pasted any image
export const useInputPasteUpload = (onUpload: (files: File[]) => void) => {
  return useCallback(
    async event => {
      const image = await getImageFromPaste(event);

      if (!image) return;

      onUpload([image]);
    },
    [onUpload]
  );
};
