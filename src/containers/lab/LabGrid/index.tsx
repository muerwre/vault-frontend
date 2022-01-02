import React, { FC, useMemo } from 'react';
import Masonry from 'react-masonry-css';
import styles from './styles.module.scss';
import { LabNode } from '~/components/lab/LabNode';
import { EMPTY_NODE, NODE_TYPES } from '~/constants/node';
import { values } from 'ramda';
import { useLabPagination } from '~/hooks/lab/useLabPagination';
import { useLabContext } from '~/utils/context/LabContextProvider';

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
  const { isLoading, nodes, onLoadMore } = useLabContext();

  const columns = useMemo(() => Array.from(document.querySelectorAll(`.${styles.column}`)), []);

  useLabPagination(isLoading, columns, onLoadMore);

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
  );
};

export { LabGrid };
