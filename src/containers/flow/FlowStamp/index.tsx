import React, { FC, FormEvent, useCallback, useMemo } from 'react';

import classNames from 'classnames';

import { Superpower } from '~/components/common/Superpower';
import { Group } from '~/components/containers/Group';
import { FlowRecent } from '~/components/flow/FlowRecent';
import { FlowSearchResults } from '~/components/flow/FlowSearchResults';
import { Icon } from '~/components/input/Icon';
import { InputText } from '~/components/input/InputText';
import { Toggle } from '~/components/input/Toggle';
import { experimentalFeatures } from '~/constants/features';
import styles from '~/containers/flow/FlowStamp/styles.module.scss';
import { useFlowContext } from '~/utils/providers/FlowProvider';
import { useSearchContext } from '~/utils/providers/SearchProvider';

interface IProps {
  isFluid: boolean;
  onToggleLayout: () => void;
}

const FlowStamp: FC<IProps> = ({ isFluid, onToggleLayout }) => {
  const {
    searchText,
    hasMore: searchHasMore,
    searchIsLoading,
    searchResults,
    setSearchText,
    loadMore: onSearchLoadMore,
  } = useSearchContext();

  const { recent, updates } = useFlowContext();

  const onSearchSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();
  }, []);

  const onClearSearch = useCallback(() => setSearchText(''), [setSearchText]);

  const onKeyUp = useCallback(
    (event) => {
      if (event.key !== 'Escape') return;
      onClearSearch();
      event.target.blur();
    },
    [onClearSearch],
  );

  const after = useMemo(
    () =>
      searchText ? (
        <Icon
          icon="close"
          size={24}
          className={styles.close_icon}
          onClick={onClearSearch}
        />
      ) : (
        <Icon icon="search" size={24} className={styles.search_icon} />
      ),
    [onClearSearch, searchText],
  );

  return (
    <div className={styles.wrap}>
      <form className={styles.search} onSubmit={onSearchSubmit}>
        <InputText
          title="Поиск"
          value={searchText}
          handler={setSearchText}
          suffix={after}
          onKeyUp={onKeyUp}
        />
      </form>

      {searchText ? (
        <div className={styles.search_results}>
          <div className={styles.grid}>
            <div className={styles.label}>
              <span className={styles.label_text}>Результаты поиска</span>
              <span className="line" />
            </div>

            <div className={styles.items}>
              <FlowSearchResults
                hasMore={searchHasMore}
                isLoading={searchIsLoading}
                results={searchResults}
                onLoadMore={onSearchLoadMore}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          <div className={classNames(styles.label, styles.whatsnew)}>
            <span className={styles.label_text}>Что нового?</span>
            <span className="line" />
          </div>

          <div className={styles.items}>
            <FlowRecent updated={updates} recent={recent} />
          </div>
        </div>
      )}

      {experimentalFeatures.liquidFlow && (
        <Superpower>
          <div className={styles.toggles}>
            <Group
              horizontal
              onClick={onToggleLayout}
              className={styles.fluid_toggle}
            >
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
