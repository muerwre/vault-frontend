import { useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import isBefore from 'date-fns/isBefore';
import { authSetState, authSetUser } from '~/redux/auth/actions';
import { borisLoadStats } from '~/redux/boris/actions';
import { useUser } from '~/hooks/user/userUser';
import { IComment } from '~/redux/types';
import { useShallowSelect } from '~/hooks/data/useShallowSelect';
import { selectAuthIsTester } from '~/redux/auth/selectors';
import { selectBorisStats } from '~/redux/boris/selectors';
import { useRandomPhrase } from '~/constants/phrases';

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

  useEffect(() => {
    dispatch(borisLoadStats());
  }, [dispatch]);

  const setIsBetaTester = useCallback(
    (is_tester: boolean) => {
      dispatch(authSetState({ is_tester }));
    },
    [dispatch]
  );

  const isTester = useShallowSelect(selectAuthIsTester);
  const stats = useShallowSelect(selectBorisStats);
  const title = useRandomPhrase('BORIS_TITLE');

  return { setIsBetaTester, isTester, stats, title };
};
