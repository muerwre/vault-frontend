import React, { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { DIALOG_CONTENT } from '~/constants/dialogs';
import { useShallowSelect } from '~/hooks/data/useShallowSelect';
import { selectModal } from '~/redux/modal/selectors';
import { modalSetDialog, modalSetShown, modalShowDialog } from '~/redux/modal/actions';
import { ModalWrapper } from '~/components/dialogs/ModalWrapper';

type IProps = {};

const Modal: FC<IProps> = ({}) => {
  const { is_shown, dialog } = useShallowSelect(selectModal);
  const dispatch = useDispatch();

  const onRequestClose = useCallback(() => {
    dispatch(modalSetShown(false));
    dispatch(modalSetDialog(''));
  }, [dispatch]);

  const onDialogChange = useCallback((val: string) => dispatch(modalShowDialog(val)), [dispatch]);

  if (!dialog || !DIALOG_CONTENT[dialog] || !is_shown) return null;

  return (
    <ModalWrapper onOverlayClick={onRequestClose}>
      {React.createElement(DIALOG_CONTENT[dialog], {
        onRequestClose,
        onDialogChange,
      })}
    </ModalWrapper>
  );
};

export { Modal };
