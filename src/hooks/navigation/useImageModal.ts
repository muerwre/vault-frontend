import { useCallback } from 'react';
import { IFile } from '~/types';
import { useShowModal } from '~/hooks/modal/useShowModal';
import { Dialog } from '~/constants/modal';

export const useImageModal = () => {
  const showModal = useShowModal(Dialog.Photoswipe);

  return useCallback(
    (images: IFile[], index: number) => {
      showModal({ items: images, index });
    },
    [showModal]
  );
};
