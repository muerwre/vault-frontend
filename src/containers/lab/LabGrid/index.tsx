import { FC, memo } from 'react';

import { Hoverable } from '~/components/common/Hoverable';
import { Columns } from '~/components/containers/Columns';
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
          <Hoverable key={node.node.id} effect="shine">
            <LabNode
              node={node.node}
              lastSeen={node.last_seen}
              commentCount={node.comment_count}
            />
          </Hoverable>
        ))}
      </Columns>
    </div>
  );
});

export { LabGrid };
