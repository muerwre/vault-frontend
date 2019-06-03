import React, { useEffect, useState } from 'react';
import * as styles from './styles.scss';
import classNames from 'classnames';

export const SidePane = ({ }) => {
  const [left, setLeft] = useState(0);

  const moveThis = () => {
    const shift = ((document.body.getBoundingClientRect().width - 1024) / 2) - 54 - 10;
    setLeft(shift);
  };

  useEffect(() => {
    window.addEventListener('resize', moveThis)

    return () => { window.removeEventListener('resize', moveThis); }
  });

  useEffect(moveThis, []);

  return (
    <div className={styles.pane} style={{ left }}>
      <div className={classNames(styles.group, 'logo')} />
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
