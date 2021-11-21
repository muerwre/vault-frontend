import React, { FC, FormEvent, useCallback, useMemo } from 'react';
import { InputText } from '~/components/input/InputText';
import { FlowRecent } from '../FlowRecent';

import styles from './styles.module.scss';
import { FlowSearchResults } from '../FlowSearchResults';
import { Icon } from '~/components/input/Icon';
import { Group } from '~/components/containers/Group';
import { Toggle } from '~/components/input/Toggle';
import classNames from 'classnames';
import { Superpower } from '~/components/boris/Superpower';
import { experimentalFeatures } from '~/constants/features';
import { IFlowNode, INode } from '~/redux/types';

interface IProps {
  searchText: string;
  searchTotal: number;
  searchIsLoading: boolean;
  searchResults: INode[];
  onSearchChange: (text: string) => void;
  onSearchLoadMore: () => void;

  recent: IFlowNode[];
  updated: IFlowNode[];
  isFluid: boolean;
  onToggleLayout: () => void;
}

const FlowStamp: FC<IProps> = ({
  searchText,
  searchIsLoading,
  searchTotal,
  searchResults,
  onSearchChange,
  onSearchLoadMore,

  recent,
  updated,
  isFluid,
  onToggleLayout,
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
      searchText ? (
        <Icon icon="close" size={24} className={styles.close_icon} onClick={onClearSearch} />
      ) : (
        <Icon icon="search" size={24} className={styles.search_icon} />
      ),
    [onClearSearch, searchText]
  );

  return (
    <div className={styles.wrap}>
      <form className={styles.search} onSubmit={onSearchSubmit}>
        <InputText
          title="Поиск"
          value={searchText}
          handler={onSearchChange}
          after={after}
          onKeyUp={onKeyUp}
        />
      </form>

      <div className={styles.grid}>
        {searchText ? (
          <>
            <div className={styles.label}>
              <span className={styles.label_text}>Результаты поиска</span>
              <span className="line" />
              <span>{!searchIsLoading && searchTotal}</span>
            </div>

            <div className={styles.items}>
              <FlowSearchResults
                isLoading={searchIsLoading}
                results={searchResults}
                onLoadMore={onSearchLoadMore}
              />
            </div>
          </>
        ) : (
          <>
            <div className={classNames(styles.label, styles.whatsnew)}>
              <span className={styles.label_text}>Что нового?</span>
              <span className="line" />
            </div>

            <div className={styles.items}>
              <FlowRecent updated={updated} recent={recent} />
            </div>
          </>
        )}
      </div>

      {experimentalFeatures.liquidFlow && (
        <Superpower>
          <div className={styles.toggles}>
            <Group horizontal onClick={onToggleLayout} className={styles.fluid_toggle}>
              <Toggle value={isFluid} />
              <div className={styles.toggles__label}>Жидкое течение</div>
            </Group>
          </div>
        </Superpower>
      )}
    </div>
  );
};

export { FlowStamp };
