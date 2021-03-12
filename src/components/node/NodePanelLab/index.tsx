import React, { FC } from 'react';
import { INode } from '~/redux/types';
import styles from './styles.module.scss';
import { URLS } from '~/constants/urls';
import { Link } from 'react-router-dom';

interface IProps {
  node: INode;
}

const NodePanelLab: FC<IProps> = ({ node }) => (
  <div className={styles.wrap}>
    <div className={styles.title}>
      <Link to={URLS.NODE_URL(node.id)}>{node.title || '...'}</Link>
    </div>
  </div>
);

export { NodePanelLab };
