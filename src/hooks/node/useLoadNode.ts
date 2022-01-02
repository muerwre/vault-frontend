import { useEffect } from 'react';
import { nodeGotoNode } from '~/redux/node/actions';
import { useDispatch } from 'react-redux';

// useLoadNode loads node on id change
export const useLoadNode = (id: any) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(nodeGotoNode(parseInt(id, 10), undefined));
  }, [dispatch, id]);
};
