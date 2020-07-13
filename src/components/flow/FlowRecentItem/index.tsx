import React, { FC } from 'react';
import { INode } from '~/redux/types';
import styles from './styles.scss';
import { URLS } from '~/constants/urls';
import { NodeRelatedItem } from '~/components/node/NodeRelatedItem';
import { getPrettyDate } from '~/utils/dom';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

interface IProps {
  node: Partial<INode>;
  has_new?: boolean;
}

const FlowRecentItem: FC<IProps> = ({ node, has_new }) => {
  return (
    <Link key={node.id} className={styles.item} to={URLS.NODE_URL(node.id)}>
      <div className={classNames(styles.thumb, { [styles.new]: has_new })}>
        <NodeRelatedItem item={node} />
      </div>

      <div className={styles.info}>
        <div className={styles.title}>{node.title || '...'}</div>
        <div className={styles.comment}>{getPrettyDate(node.created_at)}</div>
      </div>
    </Link>
  );
};

export { FlowRecentItem };
