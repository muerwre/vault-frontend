import { INode } from '~/redux/types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { nodeSetCoverImage } from '~/redux/node/actions';

export const useNodeCoverImage = (node?: INode) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!node?.cover) {
      dispatch(nodeSetCoverImage(undefined));
      return;
    }

    dispatch(nodeSetCoverImage(node.cover));

    return () => {
      dispatch(nodeSetCoverImage(undefined));
    };
  }, [node?.cover]);
};
