import assocPath from 'ramda/es/assocPath';
import { NODE_ACTIONS } from './constants';
import { nodeSetSaveErrors } from './actions';
import { INodeState } from './reducer';

const setSaveErrors = (state: INodeState, { errors }: ReturnType<typeof nodeSetSaveErrors>) => assocPath(['errors'], errors, state);

export const NODE_HANDLERS = {
  [NODE_ACTIONS.SAVE]: setSaveErrors,
};
