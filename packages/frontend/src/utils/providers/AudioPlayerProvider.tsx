import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { PlayerState } from '~/constants/player';
import { IFile } from '~/types';
import { PlayerProgress } from '~/types/player';
import { getURL } from '~/utils/dom';
import { path } from '~/utils/ramda';

interface AudioPlayerProps {
  file?: IFile;
  title: string;
  progress: PlayerProgress;
  status: PlayerState;

  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  setFile: (file: IFile) => void;
  toTime: (time: number) => void;
  toPercent: (percent: number) => void;
  /** Calls back when a track plays to its end; returns the unsubscribe. */
  onEnded: (callback: () => void) => () => void;
}

const PlayerContext = createContext<AudioPlayerProps>({
  file: undefined,
  title: '',
  progress: { progress: 0, current: 0, total: 0 },
  status: PlayerState.UNSET,

  play: async () => {},
  pause: () => {},
  stop: () => {},
  setFile: () => {},
  toTime: () => {},
  toPercent: () => {},
  onEnded: () => () => {},
});

export const AudioPlayerProvider: FC = ({ children }) => {
  const audio = useRef(
    typeof Audio !== 'undefined' ? new Audio() : undefined,
  ).current;
  const [status, setStatus] = useState(PlayerState.UNSET);
  const [file, setFile] = useState<IFile | undefined>();
  const [progress, setProgress] = useState<PlayerProgress>({
    progress: 0,
    current: 0,
    total: 0,
  });

  /**
   * Guests get songs without an address (see `isPlayable`); one of those is
   * never loaded, so whatever is playing keeps playing.
   */
  const selectFile = useCallback((next: IFile) => {
    if (isPlayable(next)) {
      setFile(next);
    }
  }, []);

  /** controls */
  const play = async () => audio?.play();
  const pause = () => audio?.pause();
  const stop = useCallback(() => {
    audio?.pause();
    audio?.dispatchEvent(new CustomEvent('stop'));
    setFile(undefined);
    setStatus(PlayerState.UNSET);
  }, [audio, setFile]);

  const onEnded = useCallback(
    (callback: () => void) => {
      audio?.addEventListener('ended', callback);
      return () => audio?.removeEventListener('ended', callback);
    },
    [audio],
  );

  const toTime = useCallback(
    (time: number) => {
      if (!audio) {
        return;
      }

      audio.currentTime = time;
    },
    [audio],
  );

  const toPercent = useCallback(
    (percent: number) => {
      toTime((progress.total * percent) / 100);
    },
    [progress, toTime],
  );

  /** handles progress update */
  useEffect(() => {
    const onProgress = () => {
      // duration stays NaN until the track's header is loaded
      const total = Number.isFinite(audio?.duration) ? audio!.duration : 0;
      const current = audio?.currentTime ?? 0;

      setProgress({
        total,
        current,
        progress: total > 0 ? (current / total) * 100 : 0,
      });
    };

    const onPause = () => {
      setStatus(PlayerState.PAUSED);
    };

    const onPlay = () => {
      setStatus(PlayerState.PLAYING);
    };

    audio?.addEventListener('playprogress', onProgress);
    audio?.addEventListener('timeupdate', onProgress);
    audio?.addEventListener('pause', onPause);
    audio?.addEventListener('playing', onPlay);

    return () => {
      audio?.removeEventListener('playprogress', onProgress);
      audio?.removeEventListener('timeupdate', onProgress);
      audio?.removeEventListener('pause', onPause);
      audio?.removeEventListener('playing', onPlay);
    };
  }, [audio]);

  /** update audio src */
  useEffect(() => {
    if (!audio) return;

    audio.src = file ? getURL(file) : '';
  }, [file, audio]);

  const metadata: IFile['metadata'] = path(['metadata'], file);
  const title =
    (metadata &&
      (metadata.title ||
        [metadata.id3artist, metadata.id3title]
          .filter((el) => !!el)
          .join(' - '))) ||
    '';

  return (
    <PlayerContext.Provider
      value={{
        file,
        setFile: selectFile,
        title,
        progress,
        toTime,
        toPercent,
        play,
        pause,
        stop,
        status,
        onEnded,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const useAudioPlayer = () => useContext(PlayerContext);

/**
 * Whether a song can be played here. A guest gets songs without their
 * address; a player shows them as usual but does nothing when started.
 */
export const isPlayable = (file?: IFile): boolean => !!file?.url;
