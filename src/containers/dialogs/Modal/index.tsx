import React, { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { ModalWrapper } from '~/components/dialogs/ModalWrapper';
import { DIALOG_CONTENT } from '~/constants/modal';
import { useModalStore } from '~/store/modal/useModalStore';
import { has } from '~/utils/ramda';

type IProps = {};

const Modal: FC<IProps> = observer(() => {
  const { current, hide, props } = useModalStore();

  if (!current || !has(current, DIALOG_CONTENT)) {
    return null;
  }

  return (
    <ModalWrapper onOverlayClick={hide}>
      {React.createElement(DIALOG_CONTENT[current!]! as any, {
        onRequestClose: hide,
        ...props,
      })}
    </ModalWrapper>
  );
});

export { Modal };
