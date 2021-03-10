import { useCallback, useEffect } from 'react';
import { getImageFromPaste } from '~/utils/uploader';

// useInputPasteUpload attaches event listener to input, that calls onUpload if user pasted any image
export const useInputPasteUpload = (
  input: HTMLTextAreaElement | HTMLInputElement | undefined,
  onUpload: (files: File[]) => void
) => {
  const onPaste = useCallback(async event => {
    const image = await getImageFromPaste(event);

    if (!image) return;

    onUpload([image]);
  }, []);

  useEffect(() => {
    if (!input) return;

    input.addEventListener('paste', onPaste);

    return () => input.removeEventListener('paste', onPaste);
  }, [input, onPaste]);
};
