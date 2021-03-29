import React, { FC, useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { FlowGrid } from '~/components/flow/FlowGrid';
import { selectFlow } from '~/redux/flow/selectors';
import * as NODE_ACTIONS from '~/redux/node/actions';
import * as FLOW_ACTIONS from '~/redux/flow/actions';
import { pick } from 'ramda';
import { selectUser } from '~/redux/auth/selectors';
import { FlowHero } from '~/components/flow/FlowHero';
import styles from './styles.module.scss';
import { IState } from '~/redux/store';
import { FlowStamp } from '~/components/flow/FlowStamp';
import { Container } from '~/containers/main/Container';
import { SidebarRouter } from '~/containers/main/SidebarRouter';

const mapStateToProps = (state: IState) => ({
  flow: pick(['nodes', 'heroes', 'recent', 'updated', 'is_loading', 'search'], selectFlow(state)),
  user: pick(['role', 'id'], selectUser(state)),
});

const mapDispatchToProps = {
  nodeGotoNode: NODE_ACTIONS.nodeGotoNode,
  flowSetCellView: FLOW_ACTIONS.flowSetCellView,
  flowGetMore: FLOW_ACTIONS.flowGetMore,
  flowChangeSearch: FLOW_ACTIONS.flowChangeSearch,
  flowLoadMoreSearch: FLOW_ACTIONS.flowLoadMoreSearch,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const FlowLayoutUnconnected: FC<IProps> = ({
  flow: { nodes, heroes, recent, updated, is_loading, search },
  user,
  nodeGotoNode,
  flowSetCellView,
  flowGetMore,
  flowChangeSearch,
  flowLoadMoreSearch,
}) => {
  const onLoadMore = useCallback(() => {
    (window as any).flowScrollPos = window.scrollY;

    const pos = window.scrollY + window.innerHeight - document.body.scrollHeight;

    if (is_loading || pos < -600) return;

    flowGetMore();
  }, [flowGetMore, is_loading]);

  const onLoadMoreSearch = useCallback(() => {
    if (search.is_loading_more) return;
    flowLoadMoreSearch();
  }, [search.is_loading_more, flowLoadMoreSearch]);

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
            updated={updated}
            search={search}
            flowChangeSearch={flowChangeSearch}
            onLoadMore={onLoadMoreSearch}
          />
        </div>

        <FlowGrid
          nodes={nodes}
          user={user}
          onSelect={nodeGotoNode}
          onChangeCellView={flowSetCellView}
        />
      </div>

      <SidebarRouter prefix="" />
    </Container>
  );
};

const FlowLayout = connect(mapStateToProps, mapDispatchToProps)(FlowLayoutUnconnected);

export { FlowLayout, FlowLayoutUnconnected };
