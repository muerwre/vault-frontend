import React, { createContext, FC, useCallback, useContext, useEffect, useState } from "react";
import { IFile } from "~/redux/types";
import { getURL } from "~/utils/dom";
import { path } from "ramda";
import { PlayerState } from "~/constants/player";
import { PlayerProgress } from "~/types/player";

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

const audio = new Audio();

export const AudioPlayerProvider: FC = ({ children }) => {
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
  }, [setFile]);

  const toTime = useCallback((time: number) => {
    audio.currentTime = time;
  }, []);

  const toPercent = useCallback(
    (percent: number) => {
      audio.currentTime = (progress.total * percent) / 100;
    },
    [progress]
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
  }, []);

  /** update audio src */
  useEffect(() => {
    audio.src = file ? getURL(file) : '';
  }, [file]);

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
