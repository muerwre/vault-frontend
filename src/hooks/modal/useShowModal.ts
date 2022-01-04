import { useCallback } from 'react';
import { useModal } from '~/hooks/modal/useModal';
import { Dialog } from '~/constants/modal';

export const useShowModal = (dialog: Dialog) => {
  const modal = useModal();

  return useCallback(() => {
    modal.showModal(dialog);
  }, [dialog, modal]);
};
