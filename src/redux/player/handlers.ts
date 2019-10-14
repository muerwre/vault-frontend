import { PLAYER_ACTIONS } from './constants';
import assocPath from 'ramda/es/assocPath';
import { playerSetFile, playerSetStatus } from './actions';

const setFile = (state, { file }: ReturnType<typeof playerSetFile>) =>
  assocPath(['file'], file, state);

const setStatus = (state, { status }: ReturnType<typeof playerSetStatus>) =>
  assocPath(['status'], status, state);

export const PLAYER_HANDLERS = {
  [PLAYER_ACTIONS.SET_FILE]: setFile,
  [PLAYER_ACTIONS.SET_STATUS]: setStatus,
};
