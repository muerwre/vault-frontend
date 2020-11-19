import React, { FC, useCallback, useEffect, useState } from 'react';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { PLAYER_STATES } from '~/redux/player/constants';
import { connect } from 'react-redux';
import { pick } from 'ramda';
import { selectPlayer } from '~/redux/player/selectors';
import * as PLAYER_ACTIONS from '~/redux/player/actions';
import { IPlayerProgress, Player } from '~/utils/player';
import { path } from 'ramda';
import { IFile } from '~/redux/types';

const mapStateToProps = state => pick(['status', 'file'], selectPlayer(state));
const mapDispatchToProps = {
  playerPlay: PLAYER_ACTIONS.playerPlay,
  playerPause: PLAYER_ACTIONS.playerPause,
  playerSeek: PLAYER_ACTIONS.playerSeek,
  playerStop: PLAYER_ACTIONS.playerStop,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const PlayerBarUnconnected: FC<IProps> = ({
  status,
  playerPlay,
  playerPause,
  playerSeek,
  playerStop,
  file,
}) => {
  const [progress, setProgress] = useState<IPlayerProgress>({ progress: 0, current: 0, total: 0 });

  const onClick = useCallback(() => {
    if (status === PLAYER_STATES.PLAYING) return playerPause();
    return playerPlay();
  }, [playerPlay, playerPause, status]);

  const onProgress = useCallback(
    ({ detail }: { detail: IPlayerProgress }) => {
      if (!detail || !detail.total) return;
      setProgress(detail);
    },
    [setProgress]
  );

  const onSeek = useCallback(
    event => {
      event.stopPropagation();
      const { clientX, target } = event;
      const { left, width } = target.getBoundingClientRect();
      playerSeek((clientX - left) / width);
    },
    [playerSeek]
  );

  useEffect(() => {
    Player.on('playprogress', onProgress);

    return () => {
      Player.off('playprogress', onProgress);
    };
  }, [onProgress]);

  if (status === PLAYER_STATES.UNSET) return null;

  const metadata: IFile['metadata'] = path(['metadata'], file);
  const title =
    metadata &&
    (metadata.title || [metadata.id3artist, metadata.id3title].filter(el => !!el).join(' - '));

  return (
    <div className={styles.place}>
      <div className={styles.wrap}>
        <div className={styles.status}>
          <div className={styles.playpause} onClick={onClick}>
            {status === PLAYER_STATES.PLAYING ? <Icon icon="pause" /> : <Icon icon="play" />}
          </div>

          <div className={styles.info}>
            <div className={styles.title}>{title}</div>

            <div className={styles.progress} onClick={onSeek}>
              <div className={styles.bar} style={{ width: `${progress.progress}%` }} />
            </div>
          </div>

          <div className={styles.close} onClick={playerStop}>
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
