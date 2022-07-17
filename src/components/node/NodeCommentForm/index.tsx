import React, { FC } from 'react';

import { CommentForm } from '~/components/comment/CommentForm';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import { IComment } from '~/types';
import { IUser } from '~/types/auth';

export interface NodeCommentFormProps {
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
