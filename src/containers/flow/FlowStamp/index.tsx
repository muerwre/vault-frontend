import { FC, FormEvent, useCallback, useMemo } from 'react';

import classNames from 'classnames';

import { Card } from '~/components/common/Card';
import { Icon } from '~/components/common/Icon';
import { NodeHorizontalCard } from '~/components/common/NodeHorizontalCard';
import { SubTitle } from '~/components/common/SubTitle';
import { InputText } from '~/components/input/InputText';
import styles from '~/containers/flow/FlowStamp/styles.module.scss';
import { useFlowContext } from '~/utils/providers/FlowProvider';
import { useSearchContext } from '~/utils/providers/SearchProvider';

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
      <Card className={styles.search}>
        <form onSubmit={onSearchSubmit}>
          <InputText
            title="Поиск"
            value={searchText}
            handler={setSearchText}
            suffix={after}
            onKeyUp={onKeyUp}
          />
        </form>
      </Card>

      {searchText ? (
        <Card className={styles.grid}>
          <SubTitle>Результаты поиска</SubTitle>

          <div className={styles.items}>
            <FlowSearchResults
              hasMore={searchHasMore}
              isLoading={searchIsLoading}
              results={searchResults}
              onLoadMore={onSearchLoadMore}
            />
          </div>
        </Card>
      ) : (
        <Card
          className={classNames(styles.grid, {
            [styles.noUpdates]: !updates.length,
          })}
        >
          <SubTitle>Что нового?</SubTitle>

          {updates.length > 0 && (
            <div className={classNames(styles.items, styles.updates)}>
              {updates.map((node) => (
                <NodeHorizontalCard node={node} key={node.id} hasNew />
              ))}
            </div>
          )}

          {recent.length > 0 && (
            <div className={classNames(styles.items, styles.recent)}>
              {recent.map((node) => (
                <NodeHorizontalCard node={node} key={node.id} />
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export { FlowStamp };
