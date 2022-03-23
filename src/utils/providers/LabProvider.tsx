import React, { FC } from 'react';

import { useLab } from '~/hooks/lab/useLab';
import { LabContextProvider } from '~/utils/context/LabContextProvider';

interface LabProviderProps {}

const LabProvider: FC<LabProviderProps> = ({ children }) => {
  const {
    isLoading,
    nodes,
    loadMore,
    hasMore,
    tags,
    heroes,
    isLoadingStats,
    updates,
    sort,
    setSort,
  } = useLab();

  return (
    <LabContextProvider
      isLoading={isLoading && !nodes.length}
      nodes={nodes}
      hasMore={hasMore}
      loadMore={loadMore}
      tags={tags}
      heroes={heroes}
      isLoadingStats={isLoadingStats}
      updates={updates}
      sort={sort}
      setSort={setSort}
    >
      {children}
    </LabContextProvider>
  );
};

export { LabProvider };
