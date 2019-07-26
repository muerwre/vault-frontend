import React, { FC, LegacyRef, ReactChild, useCallback, useEffect, useState } from 'react';
import * as styles from './styles.scss';
import classNames from 'classnames';

interface IProps {
  container: React.RefObject<HTMLDivElement>;
}

export const SidePane: FC<IProps> = ({
  container,
}) => {
  const [left, setLeft] = useState(0);

  const moveThis = useCallback(() => {
    const shift = window.innerWidth > (1024 + 64 + 20)
      ? ((window.innerWidth - 1024 - 64 - 20) / 2) - 54 - 10 + 64
      : 10;

    setLeft(shift);
    console.log({ shift });
  }, [setLeft, container]);

  useEffect(() => {
    moveThis();
    window.addEventListener('resize', moveThis);
    document.addEventListener('DOMContentLoaded', moveThis);

    return () => {
      window.removeEventListener('resize', moveThis);
      document.removeEventListener('DOMContentLoaded', moveThis);
    }
  }, [container]);

  return (
    <div className={styles.pane} style={{ transform: `translate(${left}px, 0px)` }}>
      <div
        className={classNames(styles.group, 'logo')}
      >
        <div>V</div>
      </div>

      <div className={styles.group}>
        <div className={styles.btn} />
        <div className={styles.btn} />
        <div className={styles.btn} />
        <div className={styles.btn} />
      </div>

      <div className={styles.flexy} />

      <div className={styles.group}>
        <div className={styles.btn} />
      </div>
    </div>
  );
};
