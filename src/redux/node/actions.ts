import { INode, IValidationErrors } from '../types';
import { NODE_ACTIONS } from './constants';

export const nodeSave = (node: INode) => ({
  node,
  type: NODE_ACTIONS.SAVE,
});

export const nodeSetSaveErrors = (errors: IValidationErrors) => ({
  errors,
  type: NODE_ACTIONS.SET_SAVE_ERRORS,
});
