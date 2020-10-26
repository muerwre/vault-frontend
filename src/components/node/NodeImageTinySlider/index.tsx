import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.scss';

interface IProps {}

const NodeImageTinySlider: FC<IProps> = () => {
  const sample = useRef<HTMLDivElement>(null);
  const [clientWidth, setClientWidth] = useState(document.documentElement.clientWidth);

  const style = useMemo(() => {
    if (!sample.current) return { display: 'none' };

    const { width } = sample.current.getBoundingClientRect();
    const { clientWidth } = document.documentElement;

    return {
      // width: clientWidth,
      // transform: `translate(-${(clientWidth - width) / 2}px, 0)`,
    };
  }, [sample.current, clientWidth]);

  const onResize = useCallback(() => setClientWidth(document.documentElement.clientWidth), []);

  useEffect(() => {
    window.addEventListener('resize', onResize);
    document.body.addEventListener('overflow', onResize);
    document.body.addEventListener('overflowchanged', console.log);

    document.body.addEventListener('resize', console.log);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('overflow', onResize);
    };
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.slider} style={style} />
      <div className={styles.sample} ref={sample} />
    </div>
  );
};

export { NodeImageTinySlider };
