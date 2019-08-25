import React, { FC } from 'react';
import { connect } from 'react-redux';
import { FlowGrid } from '~/components/flow/FlowGrid';
import { selectFlow } from '~/redux/flow/selectors';
import * as NODE_ACTIONS from '~/redux/node/actions';

const mapStateToProps = selectFlow;

const mapDispatchToProps = { nodeLoadNode: NODE_ACTIONS.nodeLoadNode };

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const FlowLayoutUnconnected: FC<IProps> = ({ nodes, nodeLoadNode }) => (
  <FlowGrid nodes={nodes} onSelect={nodeLoadNode} />
);

const FlowLayout = connect(
  mapStateToProps,
  mapDispatchToProps
)(FlowLayoutUnconnected);

export { FlowLayout, FlowLayoutUnconnected };
