import assocPath from 'ramda/es/assocPath';
import { NODE_ACTIONS } from './constants';
import { nodeSetSaveErrors, nodeSetLoading } from './actions';
import { INodeState } from './reducer';

const setSaveErrors = (state: INodeState, { errors }: ReturnType<typeof nodeSetSaveErrors>) =>
  assocPath(['errors'], errors, state);

const setLoading = (state: INodeState, { is_loading }: ReturnType<typeof nodeSetLoading>) =>
  assocPath(['is_loading'], is_loading, state);

export const NODE_HANDLERS = {
  [NODE_ACTIONS.SAVE]: setSaveErrors,
  [NODE_ACTIONS.SET_LOADING]: setLoading,
};
