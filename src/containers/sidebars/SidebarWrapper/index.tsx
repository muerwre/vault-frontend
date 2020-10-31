import React, { FC, useEffect, useRef } from 'react';
import styles from './styles.module.scss';
import { createPortal } from 'react-dom';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { useCloseOnEscape } from '~/utils/hooks';

interface IProps {
  onClose?: () => void;
}

const SidebarWrapper: FC<IProps> = ({ children, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useCloseOnEscape(onClose);

  useEffect(() => {
    if (!ref.current) return;
    disableBodyScroll(ref.current, { reserveScrollBarGap: true });

    return () => enableBodyScroll(ref.current);
  }, [ref.current]);

  return createPortal(
    <div className={styles.wrapper}>
      <div className={styles.clicker} onClick={onClose} />
      <div className={styles.content} ref={ref}>
        {children}
      </div>
    </div>,
    document.body
  );
};

export { SidebarWrapper };
