import React, { FC } from 'react';
import styles from './styles.module.scss';
import { PlayerBar } from '~/components/bars/PlayerBar';

type IProps = {};

const BottomContainer: FC<IProps> = () => (
  <div className={styles.wrap}>
    <div className={styles.content}>
      <div className={styles.padder}>
        <PlayerBar />
      </div>
    </div>
  </div>
);

export { BottomContainer };
