import { INode } from '~/redux/types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { nodeSetCoverImage } from '~/redux/node/actions';

export const useNodeCoverImage = (node: INode) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(nodeSetCoverImage(node.cover));

    return () => {
      nodeSetCoverImage(undefined);
    };
  }, [dispatch, node.cover, node.id]);
};
