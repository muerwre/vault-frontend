import React, { FC, MouseEventHandler, ReactElement, useEffect, useRef } from "react";
import styles from "./styles.module.scss";
import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";
import { Icon } from "~/components/input/Icon";
import { LoaderCircle } from "~/components/input/LoaderCircle";

interface IProps {
  children: React.ReactChild;
  header?: JSX.Element;
  footer?: JSX.Element;
  backdrop?: JSX.Element;
  size?: 'medium' | 'big';
  width?: number;
  error?: string;
  is_loading?: boolean;
  overlay?: ReactElement;

  onOverlayClick?: MouseEventHandler<HTMLDivElement>;
  onRefCapture?: (ref: any) => void;
  onClose?: () => void;
}

const BetterScrollDialog: FC<IProps> = ({
  children,
  header,
  footer,
  backdrop,
  width = 600,
  error,
  onClose,
  is_loading,
  overlay = null,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    disableBodyScroll(ref.current, { reserveScrollBarGap: true });

    return () => clearAllBodyScrollLocks();
  }, [ref]);

  return (
    <div className={styles.wrap} ref={ref}>
      {backdrop && <div className={styles.backdrop}>{backdrop}</div>}

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

        {!!is_loading && (
          <div className={styles.shade}>
            <LoaderCircle size={48} />
          </div>
        )}

        {overlay}

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
};

export { BetterScrollDialog };
