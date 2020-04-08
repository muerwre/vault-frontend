import React, { FC } from 'react';
import * as styles from './styles.scss';
import { IFlowState } from '~/redux/flow/reducer';
import { getURL, getPrettyDate } from '~/utils/dom';
import { Link } from 'react-router-dom';
import { URLS, PRESETS } from '~/constants/urls';
import classNames from 'classnames';
import { NodeRelatedItem } from '~/components/node/NodeRelatedItem';

interface IProps {
  recent: IFlowState['recent'];
  updated: IFlowState['updated'];
}

const FlowRecent: FC<IProps> = ({ recent, updated }) => (
  <div className={styles.grid}>
    {updated &&
      updated.slice(0, 20).map(node => (
        <Link key={node.id} className={styles.item} to={URLS.NODE_URL(node.id)}>
          <div
            className={classNames(styles.thumb, styles.new)}
            style={{ backgroundImage: `url("${getURL({ url: node.thumbnail }, PRESETS.avatar)}")` }}
          />

          <div className={styles.info}>
            <div className={styles.title}>{node.title}</div>
            <div className={styles.comment}>{getPrettyDate(node.created_at)}</div>
          </div>
        </Link>
      ))}

    {recent &&
      recent.slice(0, 20).map(node => (
        <Link key={node.id} className={styles.item} to={URLS.NODE_URL(node.id)}>
          <div className={styles.thumb}>
            <NodeRelatedItem item={node} />
          </div>

          <div className={styles.info}>
            <div className={styles.title}>{node.title}</div>
            <div className={styles.comment}>{getPrettyDate(node.created_at)}</div>
          </div>
        </Link>
      ))}
  </div>
);

export { FlowRecent };
