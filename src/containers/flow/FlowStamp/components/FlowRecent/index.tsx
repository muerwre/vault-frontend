import { FC } from 'react';

import { NodeHorizontalCard } from '~/components/common/NodeHorizontalCard';
import { IFlowNode } from '~/types';

import styles from './styles.module.scss';

interface Props {
  recent: IFlowNode[];
  updated: IFlowNode[];
}

const FlowRecent: FC<Props> = ({ recent, updated }) => {
  return (
    <>
      <div className={styles.updates}>
        {updated &&
          updated.map((node) => (
            <NodeHorizontalCard node={node} key={node.id} hasNew />
          ))}
      </div>

      <div className={styles.recent}>
        {recent &&
          recent.map((node) => (
            <NodeHorizontalCard node={node} key={node.id} />
          ))}
      </div>
    </>
  );
};

export { FlowRecent };
