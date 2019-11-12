import React, { FC, MouseEventHandler, useEffect, useRef } from 'react';
import * as styles from './styles.scss';
import { enableBodyScroll, disableBodyScroll } from 'body-scroll-lock';
import { Icon } from '~/components/input/Icon';

interface IProps {
  children: React.ReactChild;
  header?: JSX.Element;
  footer?: JSX.Element;
  size?: 'medium' | 'big';
  width?: number;
  error?: string;

  onOverlayClick?: MouseEventHandler<HTMLDivElement>;
  onRefCapture?: (ref: any) => void;
  onClose?: () => void;
}

const BetterScrollDialog: FC<IProps> = ({
  children,
  header,
  footer,
  width = 600,
  error,
  onClose,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    disableBodyScroll(ref.current, { reserveScrollBarGap: true });

    return () => enableBodyScroll(ref.current);
  }, [ref]);

  return (
    <div className={styles.wrap} ref={ref}>
      <div className={styles.container} style={{ maxWidth: width }}>
        {onClose && (
          <div className={styles.close} onClick={onClose}>
            <Icon icon="close" />
          </div>
        )}
        {header && <div className={styles.header}>{header}</div>}

        <div className={styles.body}>
          {children}
          {error && <div className={styles.error}>{error}</div>}
        </div>

        {footer && <div className={styles.header}>{footer}</div>}
      </div>
    </div>
  );
};

export { BetterScrollDialog };
