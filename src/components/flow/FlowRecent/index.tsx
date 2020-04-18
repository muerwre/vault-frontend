import React, { FC } from 'react';
import { IFlowState } from '~/redux/flow/reducer';
import { FlowRecentItem } from '../FlowRecentItem';

interface IProps {
  recent: IFlowState['recent'];
  updated: IFlowState['updated'];
}

const FlowRecent: FC<IProps> = ({ recent, updated }) => {
  return (
    <>
      {updated && updated.map(node => <FlowRecentItem node={node} key={node.id} has_new />)}

      {recent && recent.map(node => <FlowRecentItem node={node} key={node.id} />)}
    </>
  );
};

export { FlowRecent };
