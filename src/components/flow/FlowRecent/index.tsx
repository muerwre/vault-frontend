import React, { FC, useState, useCallback, FormEvent } from 'react';
import * as styles from './styles.scss';
import { IFlowState } from '~/redux/flow/reducer';
import { getURL, getPrettyDate } from '~/utils/dom';
import { Link } from 'react-router-dom';
import { URLS, PRESETS } from '~/constants/urls';
import classNames from 'classnames';
import { NodeRelatedItem } from '~/components/node/NodeRelatedItem';
import { InputText } from '~/components/input/InputText';

interface IProps {
  recent: IFlowState['recent'];
  updated: IFlowState['updated'];
}

const FlowRecent: FC<IProps> = ({ recent, updated }) => {
  const [search, setSearch] = useState('');

  const onSearchSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();
  }, []);

  return (
    <div>
      <form className={styles.search} onSubmit={onSearchSubmit}>
        <InputText title="Поиск" value={search} handler={setSearch} />
      </form>

      <div className={styles.grid}>
        <div className={styles.grid_label}>
          <span>Что нового?</span>
        </div>

        {updated &&
          updated.slice(0, 20).map(node => (
            <Link key={node.id} className={styles.item} to={URLS.NODE_URL(node.id)}>
              <div
                className={classNames(styles.thumb, styles.new)}
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
    </div>
  );
};

export { FlowRecent };
