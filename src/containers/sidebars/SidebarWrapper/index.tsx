import React, { FC, ReactNode, useEffect, useRef } from 'react';

import { clearAllBodyScrollLocks, disableBodyScroll } from 'body-scroll-lock';

import { useCloseOnEscape } from '~/hooks';

import styles from './styles.module.scss';

interface IProps {
  onClose?: () => void;
  closeOnBackdropClick?: boolean;
  backdrop?: ReactNode;
}

const SidebarWrapper: FC<IProps> = ({
  children,
  onClose,
  closeOnBackdropClick = true,
  backdrop,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useCloseOnEscape(onClose);

  useEffect(() => {
    if (!ref.current) return;
    disableBodyScroll(ref.current, { reserveScrollBarGap: true });

    return () => clearAllBodyScrollLocks();
  }, []);

  return (
    <div className={styles.wrapper} ref={ref}>
      {(closeOnBackdropClick || backdrop) && (
        <div className={styles.backdrop} onClick={onClose}>
          {backdrop}
        </div>
      )}

      {children}
    </div>
  );
};

export { SidebarWrapper };
