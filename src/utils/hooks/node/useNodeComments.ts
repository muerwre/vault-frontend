import { useCallback } from 'react';
import { nodeLoadMoreComments, nodeLockComment } from '~/redux/node/actions';
import { IComment, INode } from '~/redux/types';
import { useDispatch } from 'react-redux';

export const useNodeComments = (id: INode['id']) => {
  const dispatch = useDispatch();

  const onLoadMoreComments = useCallback(() => dispatch(nodeLoadMoreComments()), [dispatch]);

  const onDelete = useCallback(
    (id: IComment['id'], locked: boolean) => dispatch(nodeLockComment(id, locked)),
    [dispatch]
  );

  return { onLoadMoreComments, onDelete };
};
