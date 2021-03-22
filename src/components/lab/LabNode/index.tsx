import React, { FC } from 'react';
import { INode } from '~/redux/types';
import { NodePanelInner } from '~/components/node/NodePanelInner';
import { useNodeBlocks } from '~/utils/hooks/node/useNodeBlocks';
import styles from './styles.module.scss';
import { Card } from '~/components/containers/Card';
import { LabNodeTitle } from '~/components/lab/LabNodeTitle';
import { Grid } from '~/components/containers/Grid';

interface IProps {
  node: INode;
}

const LabNode: FC<IProps> = ({ node }) => {
  const { lab } = useNodeBlocks(node, false);

  return <div className={styles.wrap}>{lab}</div>;
};

export { LabNode };
