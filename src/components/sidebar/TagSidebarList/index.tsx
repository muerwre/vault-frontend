import React, { FC } from 'react';

import { FlowRecentItem } from '~/components/flow/FlowRecentItem';
import { INode } from '~/types';

import styles from './styles.module.scss';

interface IProps {
  nodes: INode[];
}

const TagSidebarList: FC<IProps> = ({ nodes }) => (
  <div className={styles.list}>
    {nodes.map((node) => (
      <FlowRecentItem node={node} key={node.id} />
    ))}
  </div>
);

export { TagSidebarList };
