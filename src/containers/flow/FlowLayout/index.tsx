import React, { FC } from 'react';
import { connect } from 'react-redux';
import { FlowGrid } from '~/components/flow/FlowGrid';
import { selectFlow } from '~/redux/flow/selectors';
import * as NODE_ACTIONS from '~/redux/node/actions';
import * as FLOW_ACTIONS from '~/redux/flow/actions';
import pick from 'ramda/es/pick';
import { selectUser } from '~/redux/auth/selectors';

const mapStateToProps = state => ({
  flow: pick(['nodes', 'heroes', 'recent', 'updated'], selectFlow(state)),
  user: pick(['role', 'id'], selectUser(state)),
});

const mapDispatchToProps = {
  nodeLoadNode: NODE_ACTIONS.nodeLoadNode,
  flowSetCellView: FLOW_ACTIONS.flowSetCellView,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const FlowLayoutUnconnected: FC<IProps> = ({
  flow: { nodes, heroes, recent, updated },
  user,
  nodeLoadNode,
  flowSetCellView,
}) => (
  <FlowGrid
    nodes={nodes}
    heroes={heroes}
    recent={recent}
    updated={updated}
    onSelect={nodeLoadNode}
    user={user}
    onChangeCellView={flowSetCellView}
  />
);

const FlowLayout = connect(
  mapStateToProps,
  mapDispatchToProps
)(FlowLayoutUnconnected);

export { FlowLayout, FlowLayoutUnconnected };
