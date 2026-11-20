import { useCallback } from 'react';

import type { DIALOG_CONTENT } from '~/constants/modal';
import { Dialog, GUEST_DIALOGS } from '~/constants/modal/dialog';
import { useAuthStore } from '~/store/auth/useAuthStore';
import { useModalStore } from '~/store/modal/useModalStore';
import { DialogComponentProps } from '~/types/modal';

export type DialogContentProps = {
  [K in keyof typeof DIALOG_CONTENT]: (typeof DIALOG_CONTENT)[K] extends (
    props: infer U,
  ) => any
    ? U extends DialogComponentProps
      ? keyof Omit<U, 'onRequestClose' | 'children'> extends never
        ? {}
        : Omit<U, 'onRequestClose' | 'children'>
      : {}
    : {};
};

export const useModal = () => {
  const { setCurrent, hide, current } = useModalStore();
  const auth = useAuthStore();

  const showModal = useCallback(
    <T extends Dialog>(dialog: T, props: DialogContentProps[T]) => {
      // read when asked, not when rendered: a login may have just landed
      if (auth.isUser && GUEST_DIALOGS.includes(dialog)) {
        return;
      }

      setCurrent(dialog, props);
    },
    [setCurrent, auth],
  );

  return { showModal, hideModal: hide, current, isOpened: !!current };
};
