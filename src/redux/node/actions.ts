import { INode, IValidationErrors } from '../types';
import { NODE_ACTIONS } from './constants';
import { INodeState } from './reducer';

export const nodeSave = (node: INode) => ({
  node,
  type: NODE_ACTIONS.SAVE,
});

export const nodeSetSaveErrors = (errors: IValidationErrors) => ({
  errors,
  type: NODE_ACTIONS.SET_SAVE_ERRORS,
});

export const nodeLoadNode = (id: string | number) => ({
  id,
  type: NODE_ACTIONS.LOAD_NODE,
});

export const nodeSetLoading = (is_loading: INodeState['is_loading']) => ({
  is_loading,
  type: NODE_ACTIONS.SET_LOADING,
});
