import { FC, createElement, Suspense, useMemo } from 'react';

import { observer } from 'mobx-react-lite';

import { DialogBackdropContext } from '~/components/common/BetterScrollDialog/context';
import { LoaderCircle } from '~/components/common/LoaderCircle';
import { ModalWrapper } from '~/components/common/ModalWrapper';
import { AUTH_DIALOGS, DIALOG_CONTENT } from '~/constants/modal';
import { LoginStaticScene } from '~/containers/auth/LoginDialog/components/LoginStaticScene';
import { useModalStore } from '~/store/modal/useModalStore';
import { has } from '~/utils/ramda';

type Props = {};

const Modal: FC<Props> = observer(() => {
  const { current, hide, props } = useModalStore();
  const isOpen = Boolean(current);

  // Picked each time the modal opens, then kept while dialogs switch inside it.
  const scene = useMemo(
    () => (Math.random() <= 0.5 ? 'clouds' : 'nowhere'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen],
  );

  if (!current || !has(current, DIALOG_CONTENT)) {
    return null;
  }

  const backdrop = AUTH_DIALOGS.includes(current) ? (
    <LoginStaticScene scene={scene} />
  ) : undefined;

  return (
    <ModalWrapper onOverlayClick={hide}>
      <DialogBackdropContext.Provider value={backdrop}>
        <Suspense fallback={<LoaderCircle />}>
          {createElement(DIALOG_CONTENT[current!]! as any, {
            onRequestClose: hide,
            ...props,
          })}
        </Suspense>
      </DialogBackdropContext.Provider>
    </ModalWrapper>
  );
});

export { Modal };
