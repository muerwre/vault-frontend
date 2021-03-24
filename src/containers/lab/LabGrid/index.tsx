import React, { FC } from 'react';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import styles from './styles.module.scss';
import { LabNode } from '~/components/lab/LabNode';
import { selectLabListNodes } from '~/redux/lab/selectors';

interface IProps {}

const LabGrid: FC<IProps> = () => {
  const nodes = useShallowSelect(selectLabListNodes);

  return (
    <div className={styles.wrap}>
      {nodes.map(node => (
        <LabNode node={node.node} key={node.node.id} />
      ))}
    </div>
  );
};

export { LabGrid };
