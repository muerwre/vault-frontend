const prefix = 'PLAYER.';

export const PLAYER_ACTIONS = {
  SET_FILE: `${prefix}SET_FILE`,
  SET_FILE_AND_PLAY: `${prefix}SET_FILE_AND_PLAY`,
  SET_STATUS: `${prefix}SET_STATUS`,

  PLAY: `${prefix}PLAY`,
  PAUSE: `${prefix}PAUSE`,
  SEEK: `${prefix}SEEK`,
  STOP: `${prefix}STOP`,
  STOPPED: `${prefix}STOPPED`,
};

export const PLAYER_STATES = {
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  UNSET: 'UNSET',
};
