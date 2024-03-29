import { FC, FormEvent, useCallback, useMemo } from 'react';

import classNames from 'classnames';

import { Group } from '~/components/common/Group';
import { Icon } from '~/components/common/Icon';
import { Superpower } from '~/components/common/Superpower';
import { InputText } from '~/components/input/InputText';
import { Toggle } from '~/components/input/Toggle';
import { experimentalFeatures } from '~/constants/features';
import styles from '~/containers/flow/FlowStamp/styles.module.scss';
import { useFlowContext } from '~/utils/providers/FlowProvider';
import { useSearchContext } from '~/utils/providers/SearchProvider';

import { FlowRecent } from './components/FlowRecent';
import { FlowSearchResults } from './components/FlowSearchResults';

interface Props {
  isFluid: boolean;
  onToggleLayout: () => void;
}

const FlowStamp: FC<Props> = ({ isFluid, onToggleLayout }) => {
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
