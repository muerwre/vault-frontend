import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { IFile } from '~/types';
import { getURL } from '~/utils/dom';
import { path } from 'ramda';
import { PlayerState } from '~/constants/player';
import { PlayerProgress } from '~/types/player';

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
});

export const AudioPlayerProvider: FC = ({ children }) => {
  const audio = useRef(new Audio()).current;
  const [status, setStatus] = useState(PlayerState.UNSET);
  const [file, setFile] = useState<IFile | undefined>();
  const [progress, setProgress] = useState<PlayerProgress>({ progress: 0, current: 0, total: 0 });

  /** controls */
  const play = audio.play.bind(audio);
  const pause = audio.pause.bind(audio);
  const stop = useCallback(() => {
    audio.pause();
    audio.dispatchEvent(new CustomEvent('stop'));
    setFile(undefined);
    setStatus(PlayerState.UNSET);
  }, [audio, setFile]);

  const toTime = useCallback(
    (time: number) => {
      audio.currentTime = time;
    },
    [audio]
  );

  const toPercent = useCallback(
    (percent: number) => {
      audio.currentTime = (progress.total * percent) / 100;
    },
    [progress, audio]
  );

  /** handles progress update */
  useEffect(() => {
    const onProgress = () => {
      setProgress({
        total: audio.duration,
        current: audio.currentTime,
        progress: (audio.currentTime / audio.duration) * 100,
      });
    };

    const onPause = () => {
      setStatus(PlayerState.PAUSED);
    };

    const onPlay = () => {
      setStatus(PlayerState.PLAYING);
    };

    audio.addEventListener('playprogress', onProgress);
    audio.addEventListener('timeupdate', onProgress);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('playing', onPlay);

    return () => {
      audio.removeEventListener('playprogress', onProgress);
      audio.removeEventListener('timeupdate', onProgress);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('playing', onPlay);
    };
  }, [audio]);

  /** update audio src */
  useEffect(() => {
    audio.src = file ? getURL(file) : '';
  }, [file, audio]);

  const metadata: IFile['metadata'] = path(['metadata'], file);
  const title =
    (metadata &&
      (metadata.title || [metadata.id3artist, metadata.id3title].filter(el => !!el).join(' - '))) ||
    '';

  return (
    <PlayerContext.Provider
      value={{ file, setFile, title, progress, toTime, toPercent, play, pause, stop, status }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const useAudioPlayer = () => useContext(PlayerContext);
