import { FC, memo } from 'react';

import { Hoverable } from '~/components/common/Hoverable';
import { MasonryGrid } from '~/components/common/MasonryGrid';
import { ILabNode } from '~/types/lab';
import { useLabContext } from '~/utils/context/LabContextProvider';

import { LabNoResults } from './components/LabNoResults';
import { LabNode } from './components/LabNode';
import styles from './styles.module.scss';

interface Props {}

const getKey = (it: ILabNode) => it.node.id!;

const renderNode = (it: ILabNode) => (
  <Hoverable effect="shine">
    <LabNode
      node={it.node}
      lastSeen={it.last_seen}
      commentCount={it.comment_count}
    />
  </Hoverable>
);

const LabGrid: FC<Props> = memo(() => {
  const { nodes, hasMore, loadMore, search, setSearch, isLoading } =
    useLabContext();

  if (search && !nodes.length) {
    return <LabNoResults resetSearch={() => setSearch('')} />;
  }

  return (
    <div className={styles.wrap}>
      <MasonryGrid
        items={nodes}
        itemKey={getKey}
        render={renderNode}
        hasMore={hasMore && !isLoading}
        onLoadMore={loadMore}
      />
    </div>
  );
});

export { LabGrid };
