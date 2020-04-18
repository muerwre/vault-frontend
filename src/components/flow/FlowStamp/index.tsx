import React, { FC, useCallback, FormEvent } from 'react';
import { IFlowState } from '~/redux/flow/reducer';
import { InputText } from '~/components/input/InputText';
import { FlowRecent } from '../FlowRecent';
import classnames from 'classnames';

import * as styles from './styles.scss';
import * as FLOW_ACTIONS from '~/redux/flow/actions';
import { FlowSearchResults } from '../FlowSearchResults';

interface IProps {
  recent: IFlowState['recent'];
  updated: IFlowState['updated'];
  search: IFlowState['search'];
  flowChangeSearch: typeof FLOW_ACTIONS.flowChangeSearch;
  onLoadMore: () => void;
}

const FlowStamp: FC<IProps> = ({ recent, updated, search, flowChangeSearch, onLoadMore }) => {
  const onSearchChange = useCallback((text: string) => flowChangeSearch({ text }), [
    flowChangeSearch,
  ]);

  const onSearchSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();
  }, []);

  return (
    <div className={styles.wrap}>
      <form className={styles.search} onSubmit={onSearchSubmit}>
        <InputText title="Поиск" value={search.text} handler={onSearchChange} />
      </form>

      <div className={styles.grid}>
        {search.text ? (
          <>
            <div className={styles.label}>
              <span className={styles.label_text}>Результаты поиска</span>
              <span className="line" />
              <span>{!search.is_loading && search.total}</span>
            </div>

            <div className={styles.items}>
              <FlowSearchResults search={search} onLoadMore={onLoadMore} />
            </div>
          </>
        ) : (
          <>
            <div className={styles.label}>
              <span className={styles.label_text}>Что нового?</span>
              <span className="line" />
            </div>

            <div className={styles.items}>
              <FlowRecent updated={updated} recent={recent} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export { FlowStamp };
