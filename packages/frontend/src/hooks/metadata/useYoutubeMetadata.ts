import { useEffect } from 'react';

import { useMetadataProvider } from '~/utils/providers/MetadataProvider';

/** The metadata of a YouTube video, loaded on first use. */
export const useYoutubeMetadata = (id: string) => {
  const { queue, enqueue, metadata, pending } = useMetadataProvider();

  useEffect(() => {
    if (!id || queue.includes(id) || pending.includes(id)) {
      return;
    }

    enqueue(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return metadata[id];
};
