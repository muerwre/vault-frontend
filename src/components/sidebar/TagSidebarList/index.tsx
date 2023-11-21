import { FC } from 'react';

import { NodeHorizontalCard } from '~/components/common/NodeHorizontalCard';
import { INode } from '~/types';

import styles from './styles.module.scss';

interface IProps {
  nodes: INode[];
}

const TagSidebarList: FC<IProps> = ({ nodes }) => (
  <div className={styles.list}>
    {nodes.map((node) => (
      <NodeHorizontalCard node={node} key={node.id} />
    ))}
  </div>
);

export { TagSidebarList };
