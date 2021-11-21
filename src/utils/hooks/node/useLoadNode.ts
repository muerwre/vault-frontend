import { useEffect } from 'react';
import { nodeGotoNode, nodeSetCurrent } from '~/redux/node/actions';
import { useDispatch } from 'react-redux';
import { EMPTY_NODE } from '~/redux/node/constants';

// useLoadNode loads node on id change
export const useLoadNode = (id: any, isLoading: boolean) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoading) return;
    dispatch(nodeGotoNode(parseInt(id, 10), undefined));

    return () => {
      dispatch(nodeSetCurrent(EMPTY_NODE));
    };
  }, [dispatch, id, isLoading]);
};
