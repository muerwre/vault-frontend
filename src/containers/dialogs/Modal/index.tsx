import { FC, createElement } from 'react';

import { observer } from 'mobx-react-lite';

import { ModalWrapper } from '~/components/common/ModalWrapper';
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
      {createElement(DIALOG_CONTENT[current!]! as any, {
        onRequestClose: hide,
        ...props,
      })}
    </ModalWrapper>
  );
});

export { Modal };
