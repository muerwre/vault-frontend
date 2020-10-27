import React, { FC, useEffect, useRef } from 'react';
import styles from './styles.module.scss';
import { createPortal } from 'react-dom';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

interface IProps {}

const SidebarWrapper: FC<IProps> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    disableBodyScroll(ref.current);

    return () => enableBodyScroll(ref.current);
  }, [ref.current]);

  return createPortal(
    <div className={styles.wrapper}>
      <div className={styles.content} ref={ref}>
        {children}
      </div>
    </div>,
    document.body
  );
};

export { SidebarWrapper };
