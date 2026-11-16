import { useEffect } from 'react';

import { useMetadataProvider } from '~/utils/providers/MetadataProvider';

/** How often a video whose copy is being saved is asked about again. */
const SAVING_REFRESH_MS = 30_000;

/**
 * The metadata of a YouTube video, loaded on first use. While our copy of it
 * is queued or downloading, it is refreshed, so progress shows as it goes.
 * The caller must be an observer.
 */
export const useYoutubeMetadata = (id: string) => {
  const { queue, enqueue, metadata, pending, refresh } = useMetadataProvider();

  useEffect(() => {
    if (!id || queue.includes(id) || pending.includes(id)) {
      return;
    }

    enqueue(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const status = metadata[id]?.video?.status;
  const saving = status === 'queued' || status === 'downloading';

  useEffect(() => {
    if (!saving) {
      return;
    }

    const timer = setInterval(() => refresh(id), SAVING_REFRESH_MS);

    return () => clearInterval(timer);
  }, [id, saving, refresh]);

  return metadata[id];
};
