import React, { useCallback, useState, useEffect, memo } from 'react';
import { connect } from 'react-redux';
import { selectPlayer } from '~/redux/player/selectors';
import * as PLAYER_ACTIONS from '~/redux/player/actions';
import { IFile } from '~/redux/types';
import { PLAYER_STATES } from '~/redux/player/constants';
import { Player, IPlayerProgress } from '~/utils/player';
import classNames from 'classnames';
import * as styles from './styles.scss';
import { Icon } from '~/components/input/Icon';

const mapStateToProps = state => ({
  player: selectPlayer(state),
});

const mapDispatchToProps = {
  playerSetFileAndPlay: PLAYER_ACTIONS.playerSetFileAndPlay,
  playerPlay: PLAYER_ACTIONS.playerPlay,
  playerPause: PLAYER_ACTIONS.playerPause,
  playerSeek: PLAYER_ACTIONS.playerSeek,
};

type Props = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    file: IFile;
  };

const AudioPlayerUnconnected = memo(
  ({
    file,
    player: { file: current, status },
    playerSetFileAndPlay,
    playerPlay,
    playerPause,
    playerSeek,
  }: Props) => {
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState<IPlayerProgress>({
      progress: 0,
      current: 0,
      total: 0,
    });

    const onPlay = useCallback(() => {
      if (current && current.id === file.id) {
        if (status === PLAYER_STATES.PLAYING) return playerPause();
        return playerPlay();
      }

      playerSetFileAndPlay(file);
    }, [file, current, status, playerPlay, playerPause, playerSetFileAndPlay]);

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
      const active = current && current.id === file.id;
      setPlaying(current && current.id === file.id);

      if (active) Player.on('playprogress', onProgress);

      return () => {
        if (active) Player.off('playprogress', onProgress);
      };
    }, [file, current, setPlaying, onProgress]);

    const title =
      file.metadata &&
      (file.metadata.title ||
        [file.metadata.id3artist, file.metadata.id3title].filter(el => !!el).join(' - '));

    return (
      <div onClick={onPlay} className={classNames(styles.wrap, { playing })}>
        <div className={styles.playpause}>
          {playing && status === PLAYER_STATES.PLAYING ? (
            <Icon icon="pause" />
          ) : (
            <Icon icon="play" />
          )}
        </div>
        <div className={styles.content}>
          <div className={styles.title}>{title || 'Unknown'}</div>

          <div className={styles.progress} onClick={onSeek}>
            <div className={styles.bar} style={{ width: `${progress.progress}%` }} />
          </div>
        </div>
      </div>
    );
  }
);

export const AudioPlayer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AudioPlayerUnconnected);
