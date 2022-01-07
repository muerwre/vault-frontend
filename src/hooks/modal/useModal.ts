import { useModalStore } from '~/store/modal/useModalStore';
import { FC, useCallback, VFC } from 'react';
import { Dialog, DIALOG_CONTENT } from '~/constants/modal';
import { IDialogProps } from '~/types/modal';

export type DialogContentProps = {
  [K in keyof typeof DIALOG_CONTENT]: typeof DIALOG_CONTENT[K] extends (props: infer U) => any
    ? U extends IDialogProps
      ? keyof Omit<U, 'onRequestClose' | 'children'> extends never
        ? {}
        : Omit<U, 'onRequestClose' | 'children'>
      : {}
    : {};
};

export const useModal = () => {
  const { setCurrent, hide } = useModalStore();

  const showModal = useCallback(
    <T extends Dialog>(dialog: T, props: DialogContentProps[T]) => {
      setCurrent(dialog, props);
    },
    [setCurrent]
  );

  return { showModal, hideModal: hide };
};
