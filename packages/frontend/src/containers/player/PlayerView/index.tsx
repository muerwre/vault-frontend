import { VFC } from 'react';

import { useAudioPlayer } from '~/utils/providers/AudioPlayerProvider';

import { PlayerBar } from './components/PlayerBar';

const PlayerView: VFC = () => {
  const { file, stop, status } = useAudioPlayer();

  return <PlayerBar status={status} playerStop={stop} file={file} />;
};

export { PlayerView };
