import React, { FC } from "react";
import { ModalWrapper } from "~/components/dialogs/ModalWrapper";
import { DIALOG_CONTENT } from "~/constants/modal";
import { useModalStore } from "~/store/modal/useModalStore";
import { has } from "ramda";
import { observer } from "mobx-react-lite";

type IProps = {};

const Modal: FC<IProps> = observer(() => {
  const { current, hide } = useModalStore();

  if (!current || !has(current, DIALOG_CONTENT)) {
    return null;
  }

  return (
    <ModalWrapper onOverlayClick={hide}>
      {React.createElement(DIALOG_CONTENT[current!]!, {
        onRequestClose: hide,
      })}
    </ModalWrapper>
  );
});

export { Modal };
