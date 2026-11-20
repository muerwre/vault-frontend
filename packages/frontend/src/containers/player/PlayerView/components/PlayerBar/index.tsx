import { VFC } from 'react';

import classNames from 'classnames';

import { AudioPlayer } from '~/components/common/AudioPlayer';
import { Icon } from '~/components/common/Icon';
import { PlayerState } from '~/constants/player';
import { IFile } from '~/types';

import styles from './styles.module.scss';

interface Props {
  status: PlayerState;
  file?: IFile;
  playerStop: () => void;
}

/**
 * The song in the player, at the bottom of the page: the same row a song
 * list shows, its button and progress driven by the player, and a cross
 * that stops it.
 */
const PlayerBar: VFC<Props> = ({ status, playerStop, file }) => {
  if (status === PlayerState.UNSET || !file) return null;

  return (
    <div
      className={classNames(styles.place, {
        [styles.playing]: status === PlayerState.PLAYING,
      })}
    >
      {/* glows around the bar while the song plays */}
      <div className={styles.halo} aria-hidden />

      <div className={styles.wrap}>
        <div className={styles.player}>
          <AudioPlayer file={file} />
        </div>

        <button
          type="button"
          className={styles.close}
          onClick={playerStop}
          aria-label="Остановить"
        >
          <Icon icon="close" />
        </button>
      </div>
    </div>
  );
};

export { PlayerBar };
