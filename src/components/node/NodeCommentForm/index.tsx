import React, { FC } from 'react';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import { connect } from 'react-redux';
import { selectAuthUser } from '~/redux/auth/selectors';
import { CommentForm } from '../../comment/CommentForm';
import { LocalCommentForm } from '~/components/comment/LocalCommentForm';
import { INode } from '~/redux/types';

const mapStateToProps = state => ({
  user: selectAuthUser(state),
});

type IProps = ReturnType<typeof mapStateToProps> & {
  isBefore?: boolean;
  nodeId: INode['id'];
};

const NodeCommentFormUnconnected: FC<IProps> = ({ user, isBefore, nodeId }) => {
  return (
    <CommentWrapper user={user}>
      <CommentForm id={0} is_before={isBefore} />
      <LocalCommentForm isBefore={isBefore} nodeId={nodeId} />
    </CommentWrapper>
  );
};

const NodeCommentForm = connect(mapStateToProps)(NodeCommentFormUnconnected);

export { NodeCommentForm };
