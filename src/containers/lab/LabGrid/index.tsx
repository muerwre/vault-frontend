import React, { FC } from 'react';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectFlowNodes } from '~/redux/flow/selectors';
import styles from './styles.module.scss';
import { LabNode } from '~/containers/lab/LabNode';

interface IProps {}

const LabGrid: FC<IProps> = () => {
  const nodes = useShallowSelect(selectFlowNodes);

  return (
    <div className={styles.wrap}>
      {nodes.map(node => (
        <LabNode node={node} key={node.id} />
      ))}
    </div>
  );
};

export { LabGrid };
