import React, { FC } from 'react';

import { values } from 'ramda';
import Masonry from 'react-masonry-css';

import { InfiniteScroll } from '~/components/containers/InfiniteScroll';
import { LabNode } from '~/components/lab/LabNode';
import { EMPTY_NODE, NODE_TYPES } from '~/constants/node';
import { useLabContext } from '~/utils/context/LabContextProvider';

import styles from './styles.module.scss';

interface IProps {}

const breakpointCols = {
  default: 2,
  1280: 1,
};

const getRandomNodeType = () =>
  values(NODE_TYPES)[Math.floor(Math.random() * values(NODE_TYPES).length)];

const LoadingNode = () => (
  <LabNode
    node={{ ...EMPTY_NODE, type: getRandomNodeType() }}
    isLoading
    lastSeen=""
    commentCount={0}
  />
);

const LabGrid: FC<IProps> = () => {
  const { isLoading, nodes, hasMore, loadMore } = useLabContext();

  if (isLoading) {
    return (
      <Masonry
        className={styles.wrap}
        breakpointCols={breakpointCols}
        columnClassName={styles.column}
      >
        <LoadingNode />
        <LoadingNode />
        <LoadingNode />
        <LoadingNode />
        <LoadingNode />
        <LoadingNode />
        <LoadingNode />
        <LoadingNode />
        <LoadingNode />
      </Masonry>
    );
  }

  return (
    <InfiniteScroll hasMore={hasMore} loadMore={loadMore}>
      <Masonry
        className={styles.wrap}
        breakpointCols={breakpointCols}
        columnClassName={styles.column}
      >
        {nodes.map(node => (
          <LabNode
            node={node.node}
            key={node.node.id}
            lastSeen={node.last_seen}
            commentCount={node.comment_count}
          />
        ))}
      </Masonry>
    </InfiniteScroll>
  );
};

export { LabGrid };
