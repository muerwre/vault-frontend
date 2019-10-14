const prefix = 'PLAYER.';

export const PLAYER_ACTIONS = {
  SET_FILE: `${prefix}SET_FILE`,
  SET_STATUS: `${prefix}SET_STATUS`,

  PLAY: `${prefix}PLAY`,
  PAUSE: `${prefix}PAUSE`,
  SEEK: `${prefix}SEEK`,
};

export const PLAYER_STATES = {
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  UNSET: 'UNSET',
};
