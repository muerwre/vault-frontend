import React, { FC } from 'react';

import { PlayerView } from '~/containers/player/PlayerView';

import styles from './styles.module.scss';

type IProps = {};

const BottomContainer: FC<IProps> = () => (
  <div className={styles.wrap}>
    <div className={styles.content}>
      <div className={styles.padder}>
        <PlayerView />
      </div>
    </div>
  </div>
);

export { BottomContainer };
