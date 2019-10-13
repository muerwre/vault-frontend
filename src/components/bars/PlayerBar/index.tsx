import React, { FC } from 'react';
import * as styles from './styles.scss';
import { Icon } from '~/components/input/Icon';
import { Filler } from '~/components/containers/Filler';
import { PLAYER_STATES } from '~/redux/player/constants';
import { connect } from 'react-redux';
import pick from 'ramda/es/pick';
import { selectPlayer } from '~/redux/player/selectors';
import * as PLAYER_ACTIONS from '~/redux/player/actions';

const mapStateToProps = state => pick(['status'], selectPlayer(state));
const mapDispatchToProps = {
  playerPlay: PLAYER_ACTIONS.playerPlay,
  playerPause: PLAYER_ACTIONS.playerPause,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const PlayerBarUnconnected: FC<IProps> = ({ status }) => {
  if (status === PLAYER_STATES.UNSET) return null;

  return (
    <div className={styles.place}>
      <div className={styles.wrap}>
        <div className={styles.status}>
          <div className={styles.playpause}>
            <Icon icon="play" />
          </div>

          <Filler />

          <div className={styles.close}>
            <Icon icon="close" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const PlayerBar = connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayerBarUnconnected);
