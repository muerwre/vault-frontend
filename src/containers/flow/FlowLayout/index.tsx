import React, { FC } from 'react';
import { connect } from 'react-redux';
import { FlowGrid } from '~/components/flow/FlowGrid';
import { selectFlow } from '~/redux/flow/selectors';

const mapStateToProps = selectFlow;

const mapDispatchToProps = {};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const FlowLayoutUnconnected: FC<IProps> = ({ nodes }) => <FlowGrid nodes={nodes} />;

const FlowLayout = connect(
  mapStateToProps,
  mapDispatchToProps
)(FlowLayoutUnconnected);

export { FlowLayout, FlowLayoutUnconnected };
