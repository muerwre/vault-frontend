import { useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import isBefore from 'date-fns/isBefore';
import { authSetState, authSetUser } from '~/redux/auth/actions';
import { useUser } from '~/hooks/user/userUser';
import { IComment } from '~/redux/types';
import { useShallowSelect } from '~/hooks/data/useShallowSelect';
import { selectAuthIsTester } from '~/redux/auth/selectors';
import { useRandomPhrase } from '~/constants/phrases';
import { useBorisStats } from '~/hooks/boris/useBorisStats';

export const useBoris = (comments: IComment[]) => {
  const dispatch = useDispatch();
  const user = useUser();

  useEffect(() => {
    const last_comment = comments[0];

    if (!last_comment) return;

    if (
      user.last_seen_boris &&
      last_comment.created_at &&
      !isBefore(new Date(user.last_seen_boris), new Date(last_comment.created_at))
    )
      return;

    dispatch(authSetUser({ last_seen_boris: last_comment.created_at }));
  }, [user.last_seen_boris, dispatch, comments]);

  const { stats, isLoading: isLoadingStats } = useBorisStats();

  const setIsBetaTester = useCallback(
    (is_tester: boolean) => {
      dispatch(authSetState({ is_tester }));
    },
    [dispatch]
  );

  const isTester = useShallowSelect(selectAuthIsTester);
  const title = useRandomPhrase('BORIS_TITLE');

  return { setIsBetaTester, isTester, stats, title, isLoadingStats };
};
