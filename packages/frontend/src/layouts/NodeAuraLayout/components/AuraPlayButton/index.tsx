import { FC, MouseEvent, useCallback, useEffect } from 'react';

import classNames from 'classnames';

import { Icon } from '~/components/common/Icon';
import { PlayerState } from '~/constants/player';
import { IFile } from '~/types';
import { formatDuration } from '~/utils/date';
import {
  isPlayable,
  useAudioPlayer,
} from '~/utils/providers/AudioPlayerProvider';

import { useTotalDuration } from '../../hooks/useTotalDuration';

import styles from './styles.module.scss';

interface Props {
  audios: IFile[];
  /** Shown until one of the songs gets into the player. */
  nodeTitle: string;
  /** See `AudioPlayer`. */
  onDisabledPlayPress?: () => void;
}

/** Same title the track list shows for a song. */
const getAudioTitle = (file?: IFile): string =>
  (file?.metadata &&
    (file.metadata.title ||
      [file.metadata.id3artist, file.metadata.id3title]
        .filter(Boolean)
        .join(' - '))) ||
  file?.orig_name ||
  '';

/**
 * Starts the node's first song, or pauses and resumes whichever of its songs
 * is already in the player; prev and next step through the node's songs,
 * and each one moves on to the next when it ends.
 * Below it, that song's title and progress; before any is played, the node's
 * title and the length of all its songs.
 */
const AuraPlayButton: FC<Props> = ({
  audios,
  nodeTitle,
  onDisabledPlayPress,
}) => {
  const { file, status, progress, setFile, play, pause, toPercent, onEnded } =
    useAudioPlayer();
  const totalDuration = useTotalDuration(audios);

  const isOwnFile = !!file && audios.some((it) => it.id === file.id);
  const isPlaying = isOwnFile && status === PlayerState.PLAYING;
  const title = isOwnFile ? getAudioTitle(file) : nodeTitle;

  // before anything is played, the first song counts as the current one
  const index = isOwnFile ? audios.findIndex((it) => it.id === file.id) : 0;
  const hasPrev = index > 0;
  const hasNext = index < audios.length - 1;

  const playAt = useCallback(
    (at: number) => {
      // play alone would resume whatever was loaded before
      if (!isPlayable(audios[at])) {
        onDisabledPlayPress?.();
        return;
      }

      setFile(audios[at]);
      setTimeout(() => void play(), 0);
    },
    [audios, setFile, play, onDisabledPlayPress],
  );

  const onClick = useCallback(async () => {
    if (!isOwnFile) {
      playAt(0);
      return;
    }

    isPlaying ? pause() : await play();
  }, [isOwnFile, isPlaying, playAt, play, pause]);

  const onSeek = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const { left, width } = event.currentTarget.getBoundingClientRect();
      toPercent(((event.clientX - left) / width) * 100);
    },
    [toPercent],
  );

  // a finished song hands over to the next one, until the last
  useEffect(() => {
    if (!isOwnFile || !hasNext) {
      return;
    }

    return onEnded(() => playAt(index + 1));
  }, [isOwnFile, hasNext, index, playAt, onEnded]);

  const onPrev = useCallback(() => playAt(index - 1), [playAt, index]);
  const onNext = useCallback(() => playAt(index + 1), [playAt, index]);

  if (!audios.length) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        {audios.length > 1 && (
          <button
            type="button"
            className={styles.step}
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label="Предыдущая"
          >
            <Icon icon="left" size={20} />
          </button>
        )}

        <button
          type="button"
          className={classNames(styles.button, {
            [styles.idle]: !isPlaying,
          })}
          onClick={onClick}
          aria-label={isPlaying ? 'Пауза' : 'Играть'}
        >
          <Icon icon={isPlaying ? 'pause' : 'play'} size={32} />
        </button>

        {audios.length > 1 && (
          <button
            type="button"
            className={styles.step}
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Следующая"
          >
            <Icon icon="right" size={20} />
          </button>
        )}
      </div>

      {!!title && <div className={styles.title}>{title}</div>}

      {isOwnFile ? (
        <div className={styles.progress}>
          <div className={styles.bar} onClick={onSeek}>
            <div
              className={styles.fill}
              style={{ width: `${progress.progress || 0}%` }}
            />
          </div>

          <div className={styles.time}>
            {formatDuration(progress.current)} /{' '}
            {formatDuration(progress.total || file?.metadata?.duration || 0)}
          </div>
        </div>
      ) : (
        !!totalDuration && (
          <div className={styles.time}>{formatDuration(totalDuration)}</div>
        )
      )}
    </div>
  );
};

export { AuraPlayButton };
