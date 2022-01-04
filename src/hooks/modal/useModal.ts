import { useModalStore } from '~/store/modal/useModalStore';
import { useCallback } from 'react';
import { Dialog } from '~/constants/modal';

export const useModal = () => {
  const { setCurrent, hide } = useModalStore();

  const showModal = useCallback(
    (dialog: Dialog) => {
      setCurrent(dialog);
    },
    [setCurrent]
  );

  return { showModal, hideModal: hide };
};
