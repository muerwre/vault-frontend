import { FC, memo } from 'react';

import { Columns } from '~/components/containers/Columns';
import { InfiniteScroll } from '~/components/containers/InfiniteScroll';
import { LabNoResults } from '~/components/lab/LabNoResults';
import { LabNode } from '~/components/lab/LabNode';
import { useLabContext } from '~/utils/context/LabContextProvider';

import styles from './styles.module.scss';

interface IProps {}

const LabGrid: FC<IProps> = memo(() => {
  const { nodes, hasMore, loadMore, search, setSearch, isLoading } =
    useLabContext();

  if (search && !nodes.length) {
    return <LabNoResults resetSearch={() => setSearch('')} />;
  }

  return (
    <div className={styles.wrap}>
      <Columns hasMore={hasMore && !isLoading} onScrollEnd={loadMore}>
        {nodes.map((node) => (
          <LabNode
            node={node.node}
            key={node.node.id}
            lastSeen={node.last_seen}
            commentCount={node.comment_count}
          />
        ))}
      </Columns>
    </div>
  );
});

export { LabGrid };
