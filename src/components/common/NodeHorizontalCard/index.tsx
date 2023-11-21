import { FC, MouseEventHandler } from 'react';

import classNames from 'classnames';

import { Anchor } from '~/components/common/Anchor';
import { NodeThumbnail } from '~/components/node/NodeThumbnail';
import { URLS } from '~/constants/urls';
import { INode } from '~/types';
import { getPrettyDate } from '~/utils/dom';

import styles from './styles.module.scss';

interface Props {
  node: Partial<INode>;
  hasNew?: boolean;
  onClick?: MouseEventHandler;
}

const NodeHorizontalCard: FC<Props> = ({ node, hasNew, onClick }) => {
  return (
    <Anchor
      key={node.id}
      className={styles.item}
      href={URLS.NODE_URL(node.id)}
      onClick={onClick}
    >
      <div
        className={classNames(styles.thumb, {
          [styles.new]: hasNew,
          [styles.lab]: !node.is_promoted,
        })}
      >
        <NodeThumbnail item={node} />
      </div>

      <div className={styles.info}>
        <div className={styles.title}>{node.title || '...'}</div>

        <div className={styles.comment}>
          <span>{getPrettyDate(node.created_at)}</span>
        </div>
      </div>
    </Anchor>
  );
};

export { NodeHorizontalCard };
