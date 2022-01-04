import { useCallback } from 'react';
import { IFile } from '~/redux/types';
import { usePhotoSwipeStore } from '~/store/photoSwipe/usePhotoSwipeStore';
import { useShowModal } from '~/hooks/modal/useShowModal';
import { Dialog } from '~/constants/modal';

export const useImageModal = () => {
  const { setData } = usePhotoSwipeStore();
  const showModal = useShowModal(Dialog.Photoswipe);

  return useCallback(
    (images: IFile[], index: number) => {
      setData(images, index);
      showModal();
    },
    [setData, showModal]
  );
};
