import { useMetadataProvider } from '~/utils/providers/MetadataProvider';
import { useEffect } from 'react';

export const useYoutubeMetadata = (id: string) => {
  const { queue, enqueue, metadata, pending } = useMetadataProvider();

  useEffect(() => {
    if (queue.includes(id) || pending.includes(id)) {
      return;
    }

    enqueue(id);
  }, [id]);

  return metadata[id];
};
