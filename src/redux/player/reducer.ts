import { createReducer } from '~/utils/reducer';
import { PLAYER_HANDLERS } from './handlers';
import { PLAYER_STATES } from './constants';
import { IFile, IEmbed } from '../types';

export type IPlayerState = Readonly<{
  status: typeof PLAYER_STATES[keyof typeof PLAYER_STATES];
  file: IFile;
  youtubes: Record<string, IEmbed>;
}>;

const INITIAL_STATE: IPlayerState = {
  status: PLAYER_STATES.UNSET,
  file: null,
  youtubes: {},
};

export default createReducer(INITIAL_STATE, PLAYER_HANDLERS);
