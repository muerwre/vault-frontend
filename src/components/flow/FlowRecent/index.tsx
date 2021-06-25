import React, { FC } from 'react';
import { IFlowState } from '~/redux/flow/reducer';
import { FlowRecentItem } from '../FlowRecentItem';
import styles from './styles.module.scss';

interface IProps {
  recent: IFlowState['recent'];
  updated: IFlowState['updated'];
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
