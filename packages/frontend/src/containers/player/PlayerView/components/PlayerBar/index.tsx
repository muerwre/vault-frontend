import { useCallback, VFC } from 'react';

import { Icon } from '~/components/common/Icon';
import { PlayerState } from '~/constants/player';
import { IFile } from '~/types';
import { PlayerProgress } from '~/types/player';
import { path } from '~/utils/ramda';

import styles from './styles.module.scss';

interface Props {
  progress: PlayerProgress;
  status: PlayerState;
  file?: IFile;
  playerPlay: () => void;
  playerPause: () => void;
  playerSeek: (pos: number) => void;
  playerStop: () => void;
}

const PlayerBar: VFC<Props> = ({
  status,
  playerPlay,
  playerPause,
  playerSeek,
  playerStop,
  progress,
  file,
}) => {
  const onClick = useCallback(() => {
    if (status === PlayerState.PLAYING) return playerPause();
    return playerPlay();
  }, [playerPlay, playerPause, status]);

  const onSeek = useCallback(
    (event) => {
      event.stopPropagation();
      const { clientX, target } = event;
      const { left, width } = target.getBoundingClientRect();
      playerSeek(((clientX - left) / width) * 100);
    },
    [playerSeek],
  );

  if (status === PlayerState.UNSET) return null;

  const metadata: IFile['metadata'] = path(['metadata'], file);
  const title =
    metadata &&
    (metadata.title ||
      [metadata.id3artist, metadata.id3title].filter((el) => !!el).join(' - '));

  return (
    <div className={styles.place}>
      <div className={styles.wrap}>
        <div className={styles.status}>
          <div className={styles.playpause} onClick={onClick}>
            {status === PlayerState.PLAYING ? (
              <Icon icon="pause" />
            ) : (
              <Icon icon="play" />
            )}
          </div>

          <div className={styles.info}>
            <div className={styles.title}>{title}</div>

            <div className={styles.progress} onClick={onSeek}>
              <div
                className={styles.bar}
                style={{ width: `${progress.progress}%` }}
              />
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

export { PlayerBar };
