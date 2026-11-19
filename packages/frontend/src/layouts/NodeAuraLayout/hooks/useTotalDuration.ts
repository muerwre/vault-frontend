import { useEffect, useState } from 'react';

import { IFile } from '~/types';
import { getURL } from '~/utils/dom';

/** Reads a track's length from its header, without downloading the rest. */
const probeDuration = (file: IFile): Promise<number> =>
  new Promise((resolve) => {
    const audio = new Audio();

    const done = (duration: number) => {
      audio.removeAttribute('src');
      audio.load();
      resolve(Number.isFinite(duration) ? duration : 0);
    };

    audio.preload = 'metadata';
    audio.onloadedmetadata = () => done(audio.duration);
    audio.onerror = () => done(0);
    audio.src = getURL(file);
  });

/**
 * Total length of the tracks in seconds. Older uploads have no stored
 * duration, so those are measured in the browser. `undefined` until known.
 */
export const useTotalDuration = (audios: IFile[]): number | undefined => {
  const [total, setTotal] = useState<number>();

  useEffect(() => {
    let cancelled = false;

    setTotal(undefined);

    Promise.all(
      audios.map((file) =>
        file.metadata?.duration
          ? Promise.resolve(file.metadata.duration)
          : probeDuration(file),
      ),
    ).then((durations) => {
      if (!cancelled) {
        setTotal(durations.reduce((sum, it) => sum + it, 0));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [audios]);

  return total;
};
