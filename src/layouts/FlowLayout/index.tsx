import React, { FC, useCallback, useEffect, useMemo } from 'react';
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
import { INode } from '~/redux/types';
import { selectLabUpdatesNodes } from '~/redux/lab/selectors';

const FlowLayout: FC = () => {
  const { nodes, heroes, recent, updated, is_loading, search } = useShallowSelect(selectFlow);
  const labUpdates = useShallowSelect(selectLabUpdatesNodes);
  const user = useShallowSelect(selectUser);
  const dispatch = useDispatch();

  const onLoadMore = useCallback(() => {
    (window as any).flowScrollPos = window.scrollY;

    const pos = window.scrollY + window.innerHeight - document.body.scrollHeight;

    if (is_loading || pos < -600) return;

    dispatch(flowGetMore());
  }, [dispatch, is_loading]);

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

  const onChangeCellView = useCallback(
    (id: INode['id'], flow: INode['flow']) => {
      dispatch(flowSetCellView(id, flow));
    },
    [dispatch]
  );

  const cumulativeUpdates = useMemo(() => [...updated, ...labUpdates].slice(0, 10), [
    updated,
    labUpdates,
  ]);

  useEffect(() => {
    window.addEventListener('scroll', onLoadMore);

    return () => window.removeEventListener('scroll', onLoadMore);
  }, [onLoadMore]);

  useEffect(() => {
    window.scrollTo(0, (window as any).flowScrollPos || 0);
  }, []);

  return (
    <Container>
      <div className={styles.grid}>
        <div className={styles.hero}>
          <FlowHero heroes={heroes} />
        </div>

        <div className={styles.stamp}>
          <FlowStamp
            recent={recent}
            updated={cumulativeUpdates}
            search={search}
            onSearchChange={onChangeSearch}
            onLoadMore={onLoadMoreSearch}
          />
        </div>

        <FlowGrid nodes={nodes} user={user} onChangeCellView={onChangeCellView} />
      </div>

      <SidebarRouter prefix="" />
    </Container>
  );
};

export { FlowLayout };
