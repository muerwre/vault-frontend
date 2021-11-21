import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectPlayer } from '~/redux/player/selectors';
import { useCallback } from 'react';
import { playerPause, playerPlay, playerSeek, playerStop } from '~/redux/player/actions';
import { useDispatch } from 'react-redux';

export const usePlayer = () => {
  const { status, file } = useShallowSelect(selectPlayer);
  const dispatch = useDispatch();

  const onPlayerPlay = useCallback(() => dispatch(playerPlay()), [dispatch]);
  const onPlayerPause = useCallback(() => dispatch(playerPause()), [dispatch]);
  const onPlayerSeek = useCallback((pos: number) => dispatch(playerSeek(pos)), [dispatch]);
  const onPlayerStop = useCallback(() => dispatch(playerStop()), [dispatch]);

  return { status, file, onPlayerPlay, onPlayerSeek, onPlayerPause, onPlayerStop };
};
