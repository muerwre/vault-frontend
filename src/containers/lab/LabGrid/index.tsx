import React, { FC } from 'react';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import styles from './styles.module.scss';
import { LabNode } from '~/components/lab/LabNode';
import { selectLabList, selectLabListNodes } from '~/redux/lab/selectors';
import { EMPTY_NODE, NODE_TYPES } from '~/redux/node/constants';
import { values } from 'ramda';

interface IProps {}

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
  const nodes = useShallowSelect(selectLabListNodes);
  const { is_loading } = useShallowSelect(selectLabList);

  if (is_loading) {
    return (
      <div className={styles.wrap}>
        <LoadingNode />
        <LoadingNode />
        <LoadingNode />
        <LoadingNode />
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {nodes.map(node => (
        <LabNode
          node={node.node}
          key={node.node.id}
          lastSeen={node.last_seen}
          commentCount={node.comment_count}
        />
      ))}
    </div>
  );
};

export { LabGrid };
