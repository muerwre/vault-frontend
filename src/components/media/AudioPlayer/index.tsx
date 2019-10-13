import React, { useCallback, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { selectPlayer } from '~/redux/player/selectors';
import * as PLAYER_ACTIONS from '~/redux/player/actions';
import { IFile } from '~/redux/types';
import { PLAYER_STATES } from '~/redux/player/constants';
import { Player } from '~/utils/player';
import classNames from 'classnames';
import * as styles from './styles.scss';
import { Icon } from '~/components/input/Icon';

const mapStateToProps = state => ({
  player: selectPlayer(state),
});

const mapDispatchToProps = {
  playerSetFile: PLAYER_ACTIONS.playerSetFile,
  playerPlay: PLAYER_ACTIONS.playerPlay,
  playerPause: PLAYER_ACTIONS.playerPause,
};

type Props = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    file: IFile;
  };

const AudioPlayerUnconnected = ({
  file,
  player: { file: current, status },

  playerSetFile,
  playerPlay,
  playerPause,
}: Props) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const onPlay = useCallback(() => {
    if (current && current.id === file.id) {
      if (status === PLAYER_STATES.PLAYING) return playerPause();
      return playerPlay();
    }

    playerSetFile(file);
  }, [file, current, status, playerPlay, playerPause, playerSetFile]);

  const onProgress = useCallback(
    ({ detail }) => {
      if (!detail || !detail.progress) return;
      setProgress(detail.progress);
    },
    [setProgress]
  );

  useEffect(() => {
    const active = current && current.id === file.id;
    setPlaying(current && current.id === file.id);

    if (active) Player.on('playprogress', onProgress);

    return () => {
      if (active) Player.off('playprogress', onProgress);
    };
  }, [file, current, setPlaying, onProgress]);

  return (
    <div onClick={onPlay} className={classNames(styles.wrap, { playing })}>
      <div className={styles.playpause}>
        {playing && status === PLAYER_STATES.PLAYING ? <Icon icon="pause" /> : <Icon icon="play" />}
      </div>
      <div className={styles.content}>
        <div className={styles.progress}>
          <div className={styles.bar} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.title}>{file.url}</div>
      </div>
    </div>
  );
};

export const AudioPlayer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AudioPlayerUnconnected);
