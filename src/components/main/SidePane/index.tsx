import React, { FC, useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';

interface IProps {
}

export const SidePane: FC<IProps> = ({
}) => {
  const content_width = 1100;
  const [left, setLeft] = useState(0);

  const moveThis = useCallback(() => {
    const { width } = document.body.getBoundingClientRect();
    const shift = width > (content_width + 64 + 20)
      ? ((width - content_width - 64 - 20) / 2) - 54 + 64 // + content_width + 74
      : 10;

    setLeft(shift);
  }, [setLeft]);

  useEffect(() => {
    moveThis();
    window.addEventListener('resize', moveThis);
    document.addEventListener('DOMContentLoaded', moveThis);

    return () => {
      window.removeEventListener('resize', moveThis);
      document.removeEventListener('DOMContentLoaded', moveThis);
    };
  }, [moveThis]);

  return (
    <div className={styles.pane} style={{ transform: `translate(${left}px, 0px)` }}>
      <Group>
        <div
          className={classNames(styles.group, 'logo')}
        >
          <div>V</div>
        </div>

        <div className={styles.btn}><div>P</div></div>

        <div className={styles.btn}><div>F</div></div>

        <div className={styles.group}>
          <div className={styles.btn} />
          <div className={styles.btn} />
          <div className={styles.btn} />
          <div className={styles.btn} />
        </div>
      </Group>

      <div className={styles.flexy} />

      <div className={styles.btn}>S</div>
    </div>
  );
};
