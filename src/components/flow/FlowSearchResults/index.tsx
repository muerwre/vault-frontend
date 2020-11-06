import React, { FC, useCallback } from 'react';
import styles from './styles.module.scss';
import { IFlowState } from '~/redux/flow/reducer';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import { FlowRecentItem } from '../FlowRecentItem';
import { Icon } from '~/components/input/Icon';

interface IProps {
  search: IFlowState['search'];
  onLoadMore: () => void;
}

const FlowSearchResults: FC<IProps> = ({ search, onLoadMore }) => {
  const onScroll = useCallback(
    event => {
      const el = event.target;
      const bottom = el.scrollHeight - el.scrollTop - el.clientHeight;

      if (bottom > 100) return;

      onLoadMore();
    },
    [onLoadMore]
  );

  if (search.is_loading) {
    return (
      <div className={styles.loading}>
        <LoaderCircle size={64} />
      </div>
    );
  }

  if (!search.results.length) {
    return (
      <div className={styles.loading}>
        <Icon size={96} icon="search" />
        <div className={styles.nothing}>Ничего не найдено</div>
      </div>
    );
  }

  return (
    <div className={styles.wrap} onScroll={onScroll}>
      {search.results.map(node => (
        <FlowRecentItem node={node} key={node.id} />
      ))}
    </div>
  );
};

export { FlowSearchResults };
