import { createReducer } from '~/utils/reducer';
import { PLAYER_HANDLERS } from './handlers';
import { PlayerState } from './constants';
import { IEmbed, IFile } from '../types';

export type IPlayerState = Readonly<{
  status: PlayerState;
  file?: IFile;
  youtubes: Record<string, IEmbed>;
}>;

const INITIAL_STATE: IPlayerState = {
  status: PlayerState.UNSET,
  file: undefined,
  youtubes: {},
};

export default createReducer(INITIAL_STATE, PLAYER_HANDLERS);
