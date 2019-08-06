import React, { FC, MouseEventHandler, ReactChild, useCallback, useEffect, useState } from "react";
// import { DialogPanel } from '~/components/panels/DialogPanel';
import { Scroll } from "~/components/containers/Scroll";
import * as styles from "./styles.scss";
import classNames from "classnames";

interface IProps {
  children: React.ReactChild;
  title?: JSX.Element;
  buttons?: JSX.Element;
  size?: "medium" | "big";
  width?: number;
  error?: string;

  top_sticky?: ReactChild;
  top_sticky_offset?: number;

  onOverlayClick?: MouseEventHandler<HTMLDivElement>;
  onRefCapture?: (ref: any) => void;
  onClose?: () => void;
}

const ScrollDialog: FC<IProps> = ({
  children,
  title,
  buttons,
  width = 800,
  top_sticky,
  top_sticky_offset,
  error,
  onOverlayClick,
  onRefCapture,
  onClose,
}) => {
  const [height, setHeight] = useState(window.innerHeight - 120);
  const [show_top_sticky, setShowTopSticky] = useState(false);
  const [ref, setRef] = useState(null);

  const onResize = useCallback(() => setHeight(window.innerHeight - 120), []);

  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onScroll = useCallback(
    ({ target: { scrollTop = 0 } = {} } = {}) => {
      if (!top_sticky || (!top_sticky_offset && top_sticky_offset !== 0)) return;

      const is_shown = scrollTop >= top_sticky_offset + 20;

      if (show_top_sticky !== is_shown) setShowTopSticky(is_shown);
    },
    [top_sticky, top_sticky_offset, show_top_sticky, setShowTopSticky]
  );

  useEffect(() => onScroll(), []);
  useEffect(() => {
    if (ref && onRefCapture) onRefCapture(ref);
  }, [ref, onRefCapture]);

  return (
    <div className={styles.container}>
      <div
        className={classNames(styles.content, {
          has_buttons: !!buttons,
          has_title: !!title,
        })}
        style={{ flexBasis: width }}
      >
        <div
          className={styles.overlay}
          onClick={onOverlayClick}
          style={{ cursor: onOverlayClick ? "pointer" : "" }}
        />

        {!!title && (
          <div className={styles.top}>
            <div className={styles.wrap} style={{ flexBasis: width }}>
              { onClose && <div className={styles.close} onClick={onClose}/> }

              <div className={styles.pan}>
                {title}
                {show_top_sticky && top_sticky && (
                  <div className={styles.top_sticky}>{top_sticky}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {!title && (
          <div className={styles.top}>
            <div className={styles.wrap} style={{ flexBasis: width }}>
              { onClose && <div className={styles.close} onClick={onClose}/> }

              <div className={styles.top_cap} />
            </div>
          </div>
        )}

        {!!buttons && (
          <div className={styles.bottom}>
            <div className={styles.wrap} style={{ flexBasis: width }}>
              <div className={classNames(styles.error, { active: error })}>{error}</div>

              <div className={styles.pan}>{buttons}</div>
            </div>
          </div>
        )}

        <div
          className={styles.scroll_wrap}
          style={{ flexBasis: width + 40 }}
        // style={{ flexBasis: width }}
        >
          <Scroll
            className="dialog_scroll"
            autoHeightMax={height}
            autoHeight
            onScroll={onScroll}
            onRef={setRef}
          >
            <div className={styles.content_wrap}>
              <div className={styles.children}>{children}</div>
            </div>
          </Scroll>
        </div>
      </div>
    </div>
  );
};

export { ScrollDialog };
