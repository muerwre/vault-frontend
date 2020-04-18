import React, { FC, useCallback, MouseEvent } from 'react';
import styles from './styles.scss';
import { IFlowState } from '~/redux/flow/reducer';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import { URLS, PRESETS } from '~/constants/urls';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { getURL, getPrettyDate } from '~/utils/dom';

interface IProps {
  search: IFlowState['search'];
  onLoadMore: () => void;
}

const FlowSearchResults: FC<IProps> = ({ search, onLoadMore }) => {
  const onScroll = useCallback(
    event => {
      const el = event.target;
      const bottom = el.scrollHeight - el.scrollTop - el.clientHeight;

      if (bottom > 100) return;

      onLoadMore();
    },
    [onLoadMore]
  );

  if (search.is_loading) {
    return (
      <div className={styles.loading}>
        <LoaderCircle size={64} />
      </div>
    );
  }

  return (
    <div className={styles.wrap} onScroll={onScroll}>
      {search.results.map(node => (
        <Link key={node.id} className={styles.item} to={URLS.NODE_URL(node.id)}>
          <div
            className={classNames(styles.thumb)}
            style={{
              backgroundImage: `url("${getURL({ url: node.thumbnail }, PRESETS.avatar)}")`,
            }}
          />

          <div className={styles.info}>
            <div className={styles.title}>{node.title}</div>
            <div className={styles.comment}>{getPrettyDate(node.created_at)}</div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export { FlowSearchResults };
