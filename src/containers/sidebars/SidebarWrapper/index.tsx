import React, { FC, useEffect, useRef } from 'react';
import styles from './styles.module.scss';
import { createPortal } from 'react-dom';
import { clearAllBodyScrollLocks, disableBodyScroll } from 'body-scroll-lock';
import { useCloseOnEscape } from '~/hooks';

interface IProps {
  onClose?: () => void;
}

const SidebarWrapper: FC<IProps> = ({ children, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useCloseOnEscape(onClose);

  useEffect(() => {
    if (!ref.current) return;
    disableBodyScroll(ref.current, { reserveScrollBarGap: true });

    return () => clearAllBodyScrollLocks();
  }, []);

  return (
    <div className={styles.wrapper} ref={ref}>
      {children}
    </div>
  );
};

export { SidebarWrapper };
