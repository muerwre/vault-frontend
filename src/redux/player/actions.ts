import { IPlayerState } from './reducer';
import { PLAYER_ACTIONS } from './constants';

export const playerSetFile = (file: IPlayerState['file']) => ({
  type: PLAYER_ACTIONS.SET_FILE,
  file,
});

export const playerSetFileAndPlay = (file: IPlayerState['file']) => ({
  type: PLAYER_ACTIONS.SET_FILE_AND_PLAY,
  file,
});

export const playerSetStatus = (status: IPlayerState['status']) => ({
  type: PLAYER_ACTIONS.SET_STATUS,
  status,
});

export const playerPlay = () => ({
  type: PLAYER_ACTIONS.PLAY,
});

export const playerPause = () => ({
  type: PLAYER_ACTIONS.PAUSE,
});

export const playerStop = () => ({
  type: PLAYER_ACTIONS.STOP,
});

export const playerStopped = () => ({
  type: PLAYER_ACTIONS.STOPPED,
});

export const playerSeek = (seek: number) => ({
  type: PLAYER_ACTIONS.SEEK,
  seek,
});
