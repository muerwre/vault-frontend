import React, { FC, MouseEventHandler } from 'react';

import { FlowRecentItem } from '~/components/flow/FlowRecentItem';
import { INode } from '~/types';

import styles from './styles.module.scss';

interface IProps {
  nodes: INode[];
  onClick?: MouseEventHandler;
}

const TagSidebarList: FC<IProps> = ({ nodes, onClick }) => (
  <div className={styles.list}>
    {nodes.map(node => (
      <FlowRecentItem node={node} key={node.id} onClick={onClick} />
    ))}
  </div>
);

export { TagSidebarList };
