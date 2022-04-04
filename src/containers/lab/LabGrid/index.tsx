import React, { FC } from 'react';

import Masonry from 'react-masonry-css';

import { Columns } from '~/components/containers/Columns';
import { InfiniteScroll } from '~/components/containers/InfiniteScroll';
import { LabNoResults } from '~/components/lab/LabNoResults';
import { LabNode } from '~/components/lab/LabNode';
import { EMPTY_NODE, NODE_TYPES } from '~/constants/node';
import { useLabContext } from '~/utils/context/LabContextProvider';
import { values } from '~/utils/ramda';

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
  const { isLoading, nodes, hasMore, loadMore, search, setSearch } = useLabContext();

  if (isLoading) {
    return (
      <Columns>
        <LoadingNode />
        <LoadingNode />
        <LoadingNode />
        <LoadingNode />
        <LoadingNode />
        <LoadingNode />
        <LoadingNode />
        <LoadingNode />
        <LoadingNode />
      </Columns>
    );
  }

  if (search && !nodes.length) {
    return <LabNoResults resetSearch={() => setSearch('')} />;
  }

  return (
    <InfiniteScroll hasMore={hasMore} loadMore={loadMore}>
      <Columns>
        {nodes.map(node => (
          <LabNode
            node={node.node}
            key={node.node.id}
            lastSeen={node.last_seen}
            commentCount={node.comment_count}
          />
        ))}
      </Columns>
    </InfiniteScroll>
  );
};

export { LabGrid };
