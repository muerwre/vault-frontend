import { useEffect, VFC } from 'react';

import { PlayerState } from '~/constants/player';
import { useAudioPlayer } from '~/utils/providers/AudioPlayerProvider';

import { PlayerBar } from './components/PlayerBar';

const PlayerView: VFC = () => {
  const { file, stop, status } = useAudioPlayer();
  const isShown = status !== PlayerState.UNSET && !!file;

  // pages keep room at their bottom for the bar only while it shows
  useEffect(() => {
    document.body.classList.toggle('player_shown', isShown);

    return () => document.body.classList.remove('player_shown');
  }, [isShown]);

  return <PlayerBar status={status} playerStop={stop} file={file} />;
};

export { PlayerView };
