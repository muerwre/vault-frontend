import React, { FC, useEffect, useRef } from 'react';

import { clearAllBodyScrollLocks, disableBodyScroll } from 'body-scroll-lock';

import { useCloseOnEscape } from '~/hooks';

import styles from './styles.module.scss';

interface IProps {
  onClose?: () => void;
  closeOnBackdropClick?: boolean;
}

const SidebarWrapper: FC<IProps> = ({ children, onClose, closeOnBackdropClick = true }) => {
  const ref = useRef<HTMLDivElement>(null);

  useCloseOnEscape(onClose);

  useEffect(() => {
    if (!ref.current) return;
    disableBodyScroll(ref.current, { reserveScrollBarGap: true });

    return () => clearAllBodyScrollLocks();
  }, []);

  return (
    <div className={styles.wrapper} ref={ref}>
      {closeOnBackdropClick && <div className={styles.backdrop} onClick={onClose} />}
      {children}
    </div>
  );
};

export { SidebarWrapper };
