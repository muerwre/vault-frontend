import React, { createContext, FC, useContext, useEffect } from 'react';

import { observer, useLocalObservable } from 'mobx-react-lite';

import { apiGetEmbedYoutube } from '~/api/metadata';
import { MetadataStore } from '~/store/metadata/MetadataStore';
import { EmbedMetadata } from '~/types/metadata';

interface MetadataContextProps {
  metadata: Record<string, EmbedMetadata>;
  queue: string[];
  pending: string[];
  enqueue: (id: string) => void;
}
const MetadataContext = createContext<MetadataContextProps>({
  metadata: {},
  queue: [],
  pending: [],
  enqueue: () => {},
});

const fetchItems = async (ids: string[]) => {
  const metadata = await apiGetEmbedYoutube(ids);
  return metadata.items;
};

export const MetadataProvider: FC = observer(({ children }) => {
  const { metadata, enqueue, queue, pending, watch } = useLocalObservable(
    () => new MetadataStore(fetchItems)
  );

  useEffect(watch, [watch]);

  return (
    <MetadataContext.Provider value={{ metadata, enqueue, queue, pending }}>
      {children}
    </MetadataContext.Provider>
  );
});

export const useMetadataProvider = () => useContext(MetadataContext);
