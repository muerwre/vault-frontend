import React, { FC, useCallback } from 'react';
import styles from './styles.module.scss';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import { FlowRecentItem } from '../FlowRecentItem';
import { Icon } from '~/components/input/Icon';
import { INode } from '~/redux/types';

interface IProps {
  isLoading: boolean;
  results: INode[];
  onLoadMore: () => void;
}

const FlowSearchResults: FC<IProps> = ({ results, isLoading, onLoadMore }) => {
  const onScroll = useCallback(
    event => {
      const el = event.target;
      const bottom = el.scrollHeight - el.scrollTop - el.clientHeight;

      if (bottom > 100) return;

      onLoadMore();
    },
    [onLoadMore]
  );

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <LoaderCircle size={64} />
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className={styles.loading}>
        <Icon size={96} icon="search" />
        <div className={styles.nothing}>Ничего не найдено</div>
      </div>
    );
  }

  return (
    <div className={styles.wrap} onScroll={onScroll}>
      {results.map(node => (
        <FlowRecentItem node={node} key={node.id} />
      ))}
    </div>
  );
};

export { FlowSearchResults };
