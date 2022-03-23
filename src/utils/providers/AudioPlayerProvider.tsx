import React, { createContext, FC, useCallback, useContext, useEffect, useRef, useState } from 'react';

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
  const audio = useRef(typeof Audio !== 'undefined' ? new Audio() : undefined).current;
  const [status, setStatus] = useState(PlayerState.UNSET);
  const [file, setFile] = useState<IFile | undefined>();
  const [progress, setProgress] = useState<PlayerProgress>({ progress: 0, current: 0, total: 0 });

  /** controls */
  const play = async () => audio?.play();
  const pause = () => audio?.pause();
  const stop = useCallback(() => {
    audio?.pause();
    audio?.dispatchEvent(new CustomEvent('stop'));
    setFile(undefined);
    setStatus(PlayerState.UNSET);
  }, [audio, setFile]);

  const toTime = useCallback(
    (time: number) => {
      if (!audio) {
        return;
      }

      audio.currentTime = time;
    },
    [audio]
  );

  const toPercent = useCallback(
    (percent: number) => {
      toTime((progress.total * percent) / 100);
    },
    [progress, toTime]
  );

  /** handles progress update */
  useEffect(() => {
    const onProgress = () => {
      setProgress({
        total: audio?.duration ?? 0,
        current: audio?.currentTime ?? 0,
        progress: audio ? (audio.currentTime / audio.duration) * 100 : 0,
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
