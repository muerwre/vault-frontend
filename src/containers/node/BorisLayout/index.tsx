import React, { FC, useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import * as NODE_ACTIONS from '~/redux/node/actions';
import { selectNode } from '~/redux/node/selectors';
import { selectUser } from '~/redux/auth/selectors';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  node: selectNode(state),
  user: selectUser(state),
});

const mapDispatchToProps = {
  nodeLoadNode: NODE_ACTIONS.nodeLoadNode,
  nodeUpdateTags: NODE_ACTIONS.nodeUpdateTags,
  nodeSetCoverImage: NODE_ACTIONS.nodeSetCoverImage,
  nodeEdit: NODE_ACTIONS.nodeEdit,
  nodeLike: NODE_ACTIONS.nodeLike,
  nodeStar: NODE_ACTIONS.nodeStar,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps &
  RouteComponentProps<{ id: string }> & {};

const id = 696;

const BorisLayoutUnconnected: FC<IProps> = ({
  node: { is_loading, is_loading_comments, comments = [], current: node, related },
  nodeLoadNode,
}) => {
  useEffect(() => {
    if (is_loading) return;
    nodeLoadNode(id);
  }, [nodeLoadNode, id]);

  return <div>{comments.length}</div>;
};

const BorisLayout = connect(
  mapStateToProps,
  mapDispatchToProps
)(BorisLayoutUnconnected);

export { BorisLayout };
