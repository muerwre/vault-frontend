import React, { FC } from 'react';
import styles from './styles.module.scss';
import { INodeComponentProps } from '~/redux/node/constants';
import { useGotoNode } from '~/hooks/node/useGotoNode';

const LabPad: FC<INodeComponentProps> = ({ node }) => {
  const onClick = useGotoNode(node.id);
  return <div className={styles.pad} onClick={onClick} />;
};

export { LabPad };
