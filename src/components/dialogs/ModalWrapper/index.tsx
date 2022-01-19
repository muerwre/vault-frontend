import React, { FC, MouseEventHandler } from 'react';

import ReactDOM from 'react-dom';

import styles from './styles.module.scss';

type IProps = {
  onOverlayClick: MouseEventHandler;
};

const ModalWrapper: FC<IProps> = ({ children, onOverlayClick }) => {
  return ReactDOM.createPortal(
    <div className={styles.fixed}>
      <div className={styles.overlay} onClick={onOverlayClick} />
      <div className={styles.content}>{children}</div>
    </div>,
    document.body
  );
};

export { ModalWrapper };
