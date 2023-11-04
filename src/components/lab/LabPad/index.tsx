import React, { FC } from 'react';

import { NodeComponentProps } from '~/constants/node';
import { useGotoNode } from '~/hooks/node/useGotoNode';

import styles from './styles.module.scss';

const LabPad: FC<NodeComponentProps> = ({ node }) => {
  const onClick = useGotoNode(node.id);
  return <div className={styles.pad} onClick={onClick} />;
};

export { LabPad };
