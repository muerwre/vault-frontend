import React, { FC } from 'react';
import { FlowRecentItem } from '../FlowRecentItem';
import styles from './styles.module.scss';
import { IFlowNode } from '~/redux/types';

interface IProps {
  recent: IFlowNode[];
  updated: IFlowNode[];
}

const FlowRecent: FC<IProps> = ({ recent, updated }) => {
  return (
    <>
      <div className={styles.updates}>
        {updated && updated.map(node => <FlowRecentItem node={node} key={node.id} has_new />)}
      </div>

      <div className={styles.recent}>
        {recent && recent.map(node => <FlowRecentItem node={node} key={node.id} />)}
      </div>
    </>
  );
};

export { FlowRecent };
