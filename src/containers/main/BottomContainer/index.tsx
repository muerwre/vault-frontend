import React, { FC } from 'react';
import * as styles from './styles.scss';
import { PlayerBar } from '~/components/bars/PlayerBar';

interface IProps {}

const BottomContainer: FC<IProps> = ({}) => (
  <div className={styles.wrap}>
    <div className={styles.content}>
      <PlayerBar />
    </div>
  </div>
);

export { BottomContainer };
