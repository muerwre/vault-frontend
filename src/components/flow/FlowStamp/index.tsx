import React, { FC, useCallback, FormEvent, useMemo, KeyboardEvent } from 'react';
import { IFlowState } from '~/redux/flow/reducer';
import { InputText } from '~/components/input/InputText';
import { FlowRecent } from '../FlowRecent';
import classnames from 'classnames';

import * as styles from './styles.scss';
import * as FLOW_ACTIONS from '~/redux/flow/actions';
import { FlowSearchResults } from '../FlowSearchResults';
import { Icon } from '~/components/input/Icon';

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

  const onClearSearch = useCallback(() => flowChangeSearch({ text: '' }), [flowChangeSearch]);

  const onKeyUp = useCallback(
    event => {
      if (event.key !== 'Escape') return;
      onClearSearch();
      event.target.blur();
    },
    [onClearSearch]
  );

  const after = useMemo(
    () =>
      search.text ? (
        <Icon icon="close" size={24} className={styles.close_icon} onClick={onClearSearch} />
      ) : (
        <Icon icon="search" size={24} className={styles.search_icon} />
      ),
    [search.text]
  );

  return (
    <div className={styles.wrap}>
      <form className={styles.search} onSubmit={onSearchSubmit}>
        <InputText
          title="Поиск"
          value={search.text}
          handler={onSearchChange}
          after={after}
          onKeyUp={onKeyUp}
        />
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
