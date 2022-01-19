import { useCallback } from 'react';

import { Dialog } from '~/constants/modal';
import { useShowModal } from '~/hooks/modal/useShowModal';
import { IFile } from '~/types';

export const useImageModal = () => {
  const showModal = useShowModal(Dialog.Photoswipe);

  return useCallback(
    (images: IFile[], index: number) => {
      showModal({ items: images, index });
    },
    [showModal]
  );
};
