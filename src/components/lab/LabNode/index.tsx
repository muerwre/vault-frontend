import React, { FC } from 'react';
import { INode } from '~/redux/types';
import { useNodeBlocks } from '~/utils/hooks/node/useNodeBlocks';
import styles from './styles.module.scss';
import { LabBottomPanel } from '~/components/lab/LabBottomPanel';

interface IProps {
  node: INode;
  isLoading?: boolean;
}

const LabNode: FC<IProps> = ({ node, isLoading }) => {
  const { lab } = useNodeBlocks(node, false);

  return (
    <div className={styles.wrap}>
      {lab}
      <LabBottomPanel node={node} isLoading={!!isLoading} />
    </div>
  );
};

export { LabNode };
