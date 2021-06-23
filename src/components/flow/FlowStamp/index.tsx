import React, { FC, FormEvent, useCallback, useMemo } from 'react';
import { IFlowState } from '~/redux/flow/reducer';
import { InputText } from '~/components/input/InputText';
import { FlowRecent } from '../FlowRecent';

import styles from './styles.module.scss';
import { FlowSearchResults } from '../FlowSearchResults';
import { Icon } from '~/components/input/Icon';
import { Group } from '~/components/containers/Group';
import { Toggle } from '~/components/input/Toggle';

interface IProps {
  recent: IFlowState['recent'];
  updated: IFlowState['updated'];
  search: IFlowState['search'];
  isFluid: boolean;
  onSearchChange: (text: string) => void;
  onLoadMore: () => void;
  toggleLayout: () => void;
}

const FlowStamp: FC<IProps> = ({
  recent,
  updated,
  search,
  onSearchChange,
  onLoadMore,
  isFluid,
  toggleLayout,
}) => {
  const onSearchSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();
  }, []);

  const onClearSearch = useCallback(() => onSearchChange(''), [onSearchChange]);

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

      <div className={styles.toggles}>
        <Group horizontal onClick={toggleLayout} className={styles.fluid_toggle}>
          <Toggle value={isFluid} />
          <div className={styles.toggles__label}>Жидкое течение</div>
        </Group>
      </div>
    </div>
  );
};

export { FlowStamp };
