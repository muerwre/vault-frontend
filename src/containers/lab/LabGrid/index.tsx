import React, { FC } from 'react';
import Masonry from 'react-masonry-css';
import styles from './styles.module.scss';
import { LabNode } from '~/components/lab/LabNode';
import { EMPTY_NODE, NODE_TYPES } from '~/redux/node/constants';
import { values } from 'ramda';
import { ILabNode } from '~/redux/lab/types';

interface IProps {
  isLoading: boolean;
  nodes: ILabNode[];
}

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

const LabGrid: FC<IProps> = ({ isLoading, nodes }) => {
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
