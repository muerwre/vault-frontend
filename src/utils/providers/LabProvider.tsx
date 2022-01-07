import React, { FC } from "react";
import { LabContextProvider } from "~/utils/context/LabContextProvider";
import { useLab } from "~/hooks/lab/useLab";

interface LabProviderProps {}

const LabProvider: FC<LabProviderProps> = ({ children }) => {
  const { isLoading, nodes, loadMore, hasMore, tags, heroes, isLoadingStats, updates } = useLab();

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
    >
      {children}
    </LabContextProvider>
  );
};

export { LabProvider };
