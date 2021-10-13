import React, { FC } from 'react';
import styles from './styles.module.scss';
import { PlayerBar } from '~/components/bars/PlayerBar';
import { selectUser } from '~/redux/auth/selectors';
import { pick } from 'ramda';
import { connect } from 'react-redux';

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
