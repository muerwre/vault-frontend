import { useCallback } from 'react';

import { Dialog } from '~/constants/modal/dialog';
import { DialogContentProps, useModal } from '~/hooks/modal/useModal';

export const useShowModal = <T extends Dialog>(dialog: T) => {
  const modal = useModal();

  return useCallback(
    (props: DialogContentProps[T]) => {
      modal.showModal(dialog, props);
    },
    [dialog, modal],
  );
};
