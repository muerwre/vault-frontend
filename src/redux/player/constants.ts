const prefix = 'PLAYER.';

export const PLAYER_ACTIONS = {
  SET: `${prefix}SET`,

  SET_FILE: `${prefix}SET_FILE`,
  SET_FILE_AND_PLAY: `${prefix}SET_FILE_AND_PLAY`,
  SET_STATUS: `${prefix}SET_STATUS`,

  PLAY: `${prefix}PLAY`,
  PAUSE: `${prefix}PAUSE`,
  SEEK: `${prefix}SEEK`,
  STOP: `${prefix}STOP`,
  STOPPED: `${prefix}STOPPED`,

  GET_YOUTUBE_INFO: `${prefix}GET_YOUTUBE_INFO`,
};

export enum PlayerState {
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  UNSET = 'UNSET',
}
