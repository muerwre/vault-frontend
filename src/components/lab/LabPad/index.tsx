import React, { FC, useCallback } from 'react';
import styles from './styles.module.scss';
import { useHistory } from 'react-router';
import { URLS } from '~/constants/urls';
import { INodeComponentProps } from '~/redux/node/constants';
import { useGotoNode } from '~/utils/hooks/node/useGotoNode';

const LabPad: FC<INodeComponentProps> = ({ node }) => {
  const onClick = useGotoNode(node.id);
  return <div className={styles.pad} onClick={onClick} />;
};

export { LabPad };
