import { PLAYER_ACTIONS } from './constants';
import { assocPath } from 'ramda';
import { playerSetFile, playerSetStatus, playerSet } from './actions';

const setFile = (state, { file }: ReturnType<typeof playerSetFile>) =>
  assocPath(['file'], file, state);

const setStatus = (state, { status }: ReturnType<typeof playerSetStatus>) =>
  assocPath(['status'], status, state);

const setPlayer = (state, { player }: ReturnType<typeof playerSet>) => ({
  ...state,
  ...player,
});

export const PLAYER_HANDLERS = {
  [PLAYER_ACTIONS.SET_FILE]: setFile,
  [PLAYER_ACTIONS.SET_STATUS]: setStatus,
  [PLAYER_ACTIONS.SET]: setPlayer,
};
