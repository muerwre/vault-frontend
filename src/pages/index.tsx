import React, { FC } from 'react';
import { FlowLayout } from '~/layouts/FlowLayout';
import { useFlow } from '~/utils/hooks/flow/useFlow';
import { useSearch } from '~/utils/hooks/search/useSearch';
import { useUser } from '~/utils/hooks/user/userUser';

interface Props {}

const FlowPage: FC<Props> = () => {
  const { updates, nodes, heroes, recent, isFluid, toggleLayout, onChangeCellView } = useFlow();
  const user = useUser();
  const { search, onSearchLoadMore, onSearchChange } = useSearch();

  return (
    <FlowLayout
      updates={updates}
      recent={recent}
      heroes={heroes}
      nodes={nodes}
      user={user}
      isFluid={isFluid}
      onToggleLayout={toggleLayout}
      onChangeCellView={onChangeCellView}
      searchResults={search.results}
      searchText={search.text}
      searchTotal={search.total}
      searchIsLoading={search.is_loading}
      onSearchLoadMore={onSearchLoadMore}
      onSearchChange={onSearchChange}
    />
  );
};

export default FlowPage;
