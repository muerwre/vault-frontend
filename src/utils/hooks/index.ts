import { useCallback, useEffect } from 'react';

export const useCloseOnEscape = (onRequestClose?: () => void, ignore_inputs = false) => {
  const onEscape = useCallback(
    event => {
      if (event.key !== 'Escape' || !onRequestClose) return;
      if (
        ignore_inputs &&
        (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA')
      )
        return;

      onRequestClose();
    },
    [ignore_inputs, onRequestClose]
  );

  useEffect(() => {
    document.addEventListener('keyup', onEscape);

    return () => {
      document.removeEventListener('keyup', onEscape);
    };
  }, [onEscape]);
};

export const useDelayedReady = (setReady: (val: boolean) => void, delay: number = 500) => {
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), delay);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [delay, setReady]);
};

/**
 * useDropZone returns onDrop handler to upload files
 * @param onUpload -- upload callback
 * @param allowedTypes -- list of allowed types
 */
export const useFileDropZone = (onUpload: (file: File[]) => void, allowedTypes?: string[]) => {
  return useCallback(
    event => {
      event.preventDefault();
      event.stopPropagation();

      const files: File[] = Array.from((event.dataTransfer?.files as File[]) || []).filter(
        (file: File) => file?.type && (!allowedTypes || allowedTypes.includes(file.type))
      );

      if (!files || !files.length) return;

      onUpload(files);
    },
    [allowedTypes, onUpload]
  );
};
