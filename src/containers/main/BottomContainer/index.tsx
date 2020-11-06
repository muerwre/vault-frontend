import React, { FC } from 'react';
import styles from './styles.module.scss';
import { PlayerBar } from '~/components/bars/PlayerBar';
import { SubmitBar } from '~/components/bars/SubmitBar';
import { selectUser } from '~/redux/auth/selectors';
import pick from 'ramda/es/pick';
import { connect } from 'react-redux';

const mapStateToProps = state => pick(['is_user'], selectUser(state));

type IProps = ReturnType<typeof mapStateToProps> & {};

const BottomContainerUnconnected: FC<IProps> = ({ is_user }) => (
  <div className={styles.wrap}>
    <div className={styles.content}>
      <PlayerBar />

      {is_user && <SubmitBar />}
    </div>
  </div>
);

const BottomContainer = connect(mapStateToProps)(BottomContainerUnconnected);
export { BottomContainer };
