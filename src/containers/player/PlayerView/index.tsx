import React, { VFC } from 'react';
import { PlayerBar } from '~/components/bars/PlayerBar';
import { useAudioPlayer } from '~/utils/providers/AudioPlayerProvider';

interface PlayerViewProps {}

const PlayerView: VFC<PlayerViewProps> = () => {
  const { file, play, toPercent: seek, stop, pause, status, progress } = useAudioPlayer();

  return (
    <PlayerBar
      progress={progress}
      status={status}
      playerPlay={play}
      playerPause={pause}
      playerSeek={seek}
      playerStop={stop}
      file={file}
    />
  );
};

export { PlayerView };
