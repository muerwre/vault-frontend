import React, { FC } from 'react';
import { LabContextProvider } from '~/utils/context/LabContextProvider';
import { useLab } from '~/utils/hooks/lab/useLab';

interface LabProviderProps {}

const LabProvider: FC<LabProviderProps> = ({ children }) => {
  const { isLoading, nodes, count, onLoadMore, tags, heroes, isLoadingStats, updates } = useLab();

  return (
    <LabContextProvider
      isLoading={isLoading && !nodes.length}
      nodes={nodes}
      count={count}
      onLoadMore={onLoadMore}
      tags={tags}
      heroes={heroes}
      isLoadingStats={isLoadingStats}
      updates={updates}
    >
      {children}
    </LabContextProvider>
  );
};

export { LabProvider };
