import React, { FC } from 'react';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import { CommentForm } from '~/components/comment/CommentForm';
import { IComment } from '~/types';
import { IUser } from '~/types/auth';

interface NodeCommentFormProps {
  user: IUser;
  nodeId?: number;
  saveComment: (comment: IComment) => Promise<unknown>;
}

const NodeCommentForm: FC<NodeCommentFormProps> = ({ user, nodeId, saveComment }) => {
  return (
    <CommentWrapper user={user} isForm>
      <CommentForm nodeId={nodeId} saveComment={saveComment} />
    </CommentWrapper>
  );
};

export { NodeCommentForm };
