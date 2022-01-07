import { useCallback } from 'react';
import { DialogContentProps, useModal } from '~/hooks/modal/useModal';
import { Dialog } from '~/constants/modal';

export const useShowModal = <T extends Dialog>(dialog: T) => {
  const modal = useModal();

  return useCallback(
    (props: DialogContentProps[T]) => {
      modal.showModal(dialog, props);
    },
    [dialog, modal]
  );
};
