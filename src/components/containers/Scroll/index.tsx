import React, { MouseEventHandler, useEffect, useState } from 'react';
import * as styles from './styles.scss';
import { Scrollbars } from 'tt-react-custom-scrollbars';
import classNames from 'classnames';

interface IProps {
  children: Element | React.ReactChild;
  style?: React.CSSProperties;
  className?: string;
  autoHeight?: boolean;
  autoHeightMax?: number;
  onRef?: (el: any) => void;
  onScroll?: MouseEventHandler;
  onScrollStop?: MouseEventHandler;
}

export const Scroll = ({
  children,
  className = '',
  onRef = null,
  ...props
}: IProps) => {
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (onRef && ref) return onRef(ref);
  }, [ref, onRef]);

  return (
    <Scrollbars
      className={classNames(styles.container, className)}
      renderTrackHorizontal={data => <div className={styles.track_horizontal} {...data} />}
      renderTrackVertical={data => <div className={styles.track_vertical} {...data} />}
      renderThumbHorizontal={data => <div className={styles.thumb_horizontal} {...data} />}
      renderThumbVertical={data => <div className={styles.thumb_vertical} {...data} />}
      renderView = {data => <div className={styles.view} {...data} />}
      hideTracksWhenNotNeeded
      universal
      ref={setRef}
      { ...props }
    >
      {children}
    </Scrollbars>
  );
};
