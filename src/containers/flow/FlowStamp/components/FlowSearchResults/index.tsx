import { FC } from 'react';

import { Icon } from '~/components/common/Icon';
import { InfiniteScroll } from '~/components/common/InfiniteScroll';
import { NodeHorizontalCard } from '~/components/common/NodeHorizontalCard';
import { INode } from '~/types';

import styles from './styles.module.scss';

interface IProps {
  isLoading: boolean;
  results: INode[];
  hasMore: boolean;
  onLoadMore: () => void;
}

const FlowSearchResults: FC<IProps> = ({ results, onLoadMore, hasMore }) => {
  if (!results.length) {
    return (
      <div className={styles.loading}>
        <Icon size={96} icon="search" />
        <div className={styles.nothing}>Ничего не найдено</div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <InfiniteScroll hasMore={hasMore} loadMore={onLoadMore}>
        {results.map((node) => (
          <NodeHorizontalCard node={node} key={node.id} />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export { FlowSearchResults };
