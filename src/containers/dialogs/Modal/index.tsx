import { FC, createElement, Suspense } from 'react';

import { observer } from 'mobx-react-lite';

import { LoaderCircle } from '~/components/common/LoaderCircle';
import { ModalWrapper } from '~/components/common/ModalWrapper';
import { DIALOG_CONTENT } from '~/constants/modal';
import { useModalStore } from '~/store/modal/useModalStore';
import { has } from '~/utils/ramda';

type Props = {};

const Modal: FC<Props> = observer(() => {
  const { current, hide, props } = useModalStore();

  if (!current || !has(current, DIALOG_CONTENT)) {
    return null;
  }

  return (
    <ModalWrapper onOverlayClick={hide}>
      <Suspense fallback={<LoaderCircle />}>
        {createElement(DIALOG_CONTENT[current!]! as any, {
          onRequestClose: hide,
          ...props,
        })}
      </Suspense>
    </ModalWrapper>
  );
});

export { Modal };
