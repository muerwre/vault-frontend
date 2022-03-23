import React, { FC, MouseEventHandler } from 'react';

import classNames from 'classnames';

import { Anchor } from '~/components/common/Anchor';
import { Icon } from '~/components/input/Icon';
import { NodeRelatedItem } from '~/components/node/NodeRelatedItem';
import { URLS } from '~/constants/urls';
import { INode } from '~/types';
import { getPrettyDate } from '~/utils/dom';

import styles from './styles.module.scss';


interface IProps {
  node: Partial<INode>;
  has_new?: boolean;
  onClick?: MouseEventHandler;
}

const FlowRecentItem: FC<IProps> = ({ node, has_new, onClick }) => {
  return (
    <Anchor key={node.id} className={styles.item} href={URLS.NODE_URL(node.id)} onClick={onClick}>
      <div
        className={classNames(styles.thumb, {
          [styles.new]: has_new,
          [styles.lab]: !node.is_promoted,
        })}
      >
        <NodeRelatedItem item={node} />
      </div>

      <div className={styles.info}>
        <div className={styles.title}>{node.title || '...'}</div>

        <div className={styles.comment}>
          {!node.is_promoted && <Icon icon="lab" size={14} />}
          <span>{getPrettyDate(node.created_at)}</span>
        </div>
      </div>
    </Anchor>
  );
};

export { FlowRecentItem };
