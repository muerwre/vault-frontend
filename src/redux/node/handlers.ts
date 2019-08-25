import assocPath from 'ramda/es/assocPath';
import { NODE_ACTIONS } from './constants';
import { nodeSetSaveErrors, nodeSetLoading, nodeSetCurrent } from './actions';
import { INodeState } from './reducer';

const setSaveErrors = (state: INodeState, { errors }: ReturnType<typeof nodeSetSaveErrors>) =>
  assocPath(['errors'], errors, state);

const setLoading = (state: INodeState, { is_loading }: ReturnType<typeof nodeSetLoading>) =>
  assocPath(['is_loading'], is_loading, state);

const setCurrent = (state: INodeState, { current }: ReturnType<typeof nodeSetCurrent>) =>
  assocPath(['current'], current, state);

export const NODE_HANDLERS = {
  [NODE_ACTIONS.SAVE]: setSaveErrors,
  [NODE_ACTIONS.SET_LOADING]: setLoading,
  [NODE_ACTIONS.SET_CURRENT]: setCurrent,
};
