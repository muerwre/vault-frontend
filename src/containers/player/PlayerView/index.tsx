import React, { VFC } from 'react';
import { PlayerBar } from '~/components/bars/PlayerBar';
import { usePlayer } from '~/hooks/player/usePlayer';

interface PlayerViewProps {}

const PlayerView: VFC<PlayerViewProps> = () => {
  const { status, file, onPlayerSeek, onPlayerStop, onPlayerPause, onPlayerPlay } = usePlayer();

  return (
    <PlayerBar
      status={status}
      playerPlay={onPlayerPlay}
      playerPause={onPlayerPause}
      playerSeek={onPlayerSeek}
      playerStop={onPlayerStop}
      file={file}
    />
  );
};

export { PlayerView };
