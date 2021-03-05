import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.scss';
import ResizeSensor from 'resize-sensor';

interface IProps {
  onRefresh?: (width: number) => void;
}

const FullWidth: FC<IProps> = ({ children, onRefresh }) => {
  const sample = useRef<HTMLDivElement>(null);
  const [clientWidth, setClientWidth] = useState(document.documentElement.clientWidth);

  const style = useMemo(() => {
    if (!sample.current) return { display: 'none' };

    const { width } = sample.current.getBoundingClientRect();
    const { clientWidth } = document.documentElement;

    if (onRefresh) onRefresh(clientWidth);

    return {
      width: clientWidth,
      transform: `translate(-${(clientWidth - width) / 2}px, 0)`,
    };
  }, [sample.current, clientWidth, onRefresh]);

  const onResize = useCallback(() => setClientWidth(document.documentElement.clientWidth), []);

  useEffect(() => {
    if (!sample.current) return;

    window.addEventListener('resize', onResize);
    new ResizeSensor(document.body, onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      ResizeSensor.detach(document.body, onResize);
    };
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.slider} style={style}>
        {children}
      </div>

      <div className={styles.sample} ref={sample} />
    </div>
  );
};

export { FullWidth };
