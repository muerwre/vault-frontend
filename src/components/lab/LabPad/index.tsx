import React, { FC, useCallback } from 'react';
import styles from './styles.module.scss';
import { useHistory } from 'react-router';
import { URLS } from '~/constants/urls';
import { INodeComponentProps } from '~/redux/node/constants';

const LabPad: FC<INodeComponentProps> = ({ node }) => {
  const history = useHistory();
  const onClick = useCallback(() => history.push(URLS.NODE_URL(node.id)), [node.id]);

  return <div className={styles.pad} onClick={onClick} />;
};

export { LabPad };
