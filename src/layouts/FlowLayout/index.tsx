import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FlowGrid } from '~/components/flow/FlowGrid';
import { selectFlow } from '~/redux/flow/selectors';
import {
  flowChangeSearch,
  flowGetMore,
  flowLoadMoreSearch,
  flowSetCellView,
} from '~/redux/flow/actions';
import { selectUser } from '~/redux/auth/selectors';
import { FlowHero } from '~/components/flow/FlowHero';
import styles from './styles.module.scss';
import { FlowStamp } from '~/components/flow/FlowStamp';
import { Container } from '~/containers/main/Container';
import { SidebarRouter } from '~/containers/main/SidebarRouter';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { FlowDisplay, INode } from '~/redux/types';
import { selectLabUpdatesNodes } from '~/redux/lab/selectors';
import { usePersistedState } from '~/utils/hooks/usePersistedState';
import classNames from 'classnames';
import { useFlowLayout } from '~/utils/hooks/flow/useFlowLayout';
import { useFlowPagination } from '~/utils/hooks/flow/useFlowPagination';
import { FlowSwiperHero } from '~/components/flow/FlowSwiperHero';

const FlowLayout: FC = () => {
  const { nodes, heroes, recent, updated, isLoading, search } = useShallowSelect(selectFlow);
  const { isFluid, toggleLayout } = useFlowLayout();
  const labUpdates = useShallowSelect(selectLabUpdatesNodes);
  const user = useShallowSelect(selectUser);
  const dispatch = useDispatch();

  useFlowPagination({ isLoading });

  const onLoadMoreSearch = useCallback(() => {
    if (search.is_loading_more) return;
    dispatch(flowLoadMoreSearch());
  }, [search.is_loading_more, dispatch]);

  const onChangeSearch = useCallback(
    (text: string) => {
      dispatch(flowChangeSearch({ text }));
    },
    [dispatch]
  );

  const cumulativeUpdates = useMemo(() => [...updated, ...labUpdates].slice(0, 10), [
    updated,
    labUpdates,
  ]);

  const onChangeCellView = useCallback(
    (id: INode['id'], val: FlowDisplay) => dispatch(flowSetCellView(id, val)),
    []
  );

  return (
    <div className={classNames(styles.container, { [styles.fluid]: isFluid })}>
      <div className={styles.grid}>
        <div className={styles.hero}>
          <FlowSwiperHero heroes={heroes} />
        </div>

        <div className={styles.stamp}>
          <FlowStamp
            recent={recent}
            updated={cumulativeUpdates}
            search={search}
            isFluid={isFluid}
            onSearchChange={onChangeSearch}
            onLoadMore={onLoadMoreSearch}
            toggleLayout={toggleLayout}
          />
        </div>

        <FlowGrid nodes={nodes} user={user} onChangeCellView={onChangeCellView} />
      </div>

      <SidebarRouter prefix="" />
    </div>
  );
};

export { FlowLayout };
