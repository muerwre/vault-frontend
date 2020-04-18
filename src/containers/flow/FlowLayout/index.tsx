import React, { FC, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { FlowGrid } from '~/components/flow/FlowGrid';
import { selectFlow } from '~/redux/flow/selectors';
import * as NODE_ACTIONS from '~/redux/node/actions';
import * as FLOW_ACTIONS from '~/redux/flow/actions';
import pick from 'ramda/es/pick';
import { selectUser } from '~/redux/auth/selectors';
import { FlowHero } from '~/components/flow/FlowHero';
import styles from './styles.scss';
import { IState } from '~/redux/store';
import { FlowStamp } from '~/components/flow/FlowStamp';

const mapStateToProps = (state: IState) => ({
  flow: pick(['nodes', 'heroes', 'recent', 'updated', 'is_loading', 'search'], selectFlow(state)),
  user: pick(['role', 'id'], selectUser(state)),
});

const mapDispatchToProps = {
  nodeGotoNode: NODE_ACTIONS.nodeGotoNode,
  flowSetCellView: FLOW_ACTIONS.flowSetCellView,
  flowGetMore: FLOW_ACTIONS.flowGetMore,
  flowChangeSearch: FLOW_ACTIONS.flowChangeSearch,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const FlowLayoutUnconnected: FC<IProps> = ({
  flow: { nodes, heroes, recent, updated, is_loading, search },
  user,
  nodeGotoNode,
  flowSetCellView,
  flowGetMore,
  flowChangeSearch,
}) => {
  const loadMore = useCallback(() => {
    const pos = window.scrollY + window.innerHeight - document.body.scrollHeight;

    if (is_loading || pos < -600) return;

    flowGetMore();
  }, [flowGetMore, is_loading]);

  useEffect(() => {
    window.addEventListener('scroll', loadMore);

    return () => window.removeEventListener('scroll', loadMore);
  }, [loadMore]);

  return (
    <div className={styles.grid}>
      <div className={styles.hero}>
        <FlowHero heroes={heroes} />
      </div>

      <div className={styles.stamp}>
        <FlowStamp
          recent={recent}
          updated={updated}
          flowChangeSearch={flowChangeSearch}
          search={search}
        />
      </div>

      <FlowGrid
        nodes={nodes}
        onSelect={nodeGotoNode}
        user={user}
        onChangeCellView={flowSetCellView}
      />
    </div>
  );
};

const FlowLayout = connect(mapStateToProps, mapDispatchToProps)(FlowLayoutUnconnected);

export { FlowLayout, FlowLayoutUnconnected };
