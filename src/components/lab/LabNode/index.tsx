import React, { FC } from 'react';
import { INode } from '~/redux/types';
import { useNodeBlocks } from '~/utils/hooks/node/useNodeBlocks';
import styles from './styles.module.scss';

interface IProps {
  node: INode;
}

const LabNode: FC<IProps> = ({ node }) => {
  const { lab } = useNodeBlocks(node, false);

  return <div className={styles.wrap}>{lab}</div>;
};

export { LabNode };
