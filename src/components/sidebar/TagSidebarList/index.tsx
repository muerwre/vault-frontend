import React, { FC, MouseEventHandler } from 'react';
import { INode } from '~/types';
import styles from './styles.module.scss';
import { FlowRecentItem } from '~/components/flow/FlowRecentItem';

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
