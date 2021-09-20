import { useCallback, useEffect } from 'react';
import { flowGetMore } from '~/redux/flow/actions';
import { useDispatch } from 'react-redux';

export const useFlowPagination = ({ isLoading }) => {
  const dispatch = useDispatch();

  const onLoadMore = useCallback(() => {
    (window as any).flowScrollPos = window.scrollY;

    const pos = window.scrollY + window.innerHeight - document.body.scrollHeight;

    if (isLoading || pos < -600) return;

    dispatch(flowGetMore());
  }, [dispatch, isLoading]);

  useEffect(() => {
    window.addEventListener('scroll', onLoadMore);

    return () => window.removeEventListener('scroll', onLoadMore);
  }, [onLoadMore]);
};
