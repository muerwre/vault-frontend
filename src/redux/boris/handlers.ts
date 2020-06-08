import { IBorisState } from './reducer';
import { BORIS_ACTIONS } from './constants';

const borisSet = (current: IBorisState, { state }: ReturnType<typeof borisSet>) => ({
  ...current,
  ...state,
});

export const BORIS_HANDLERS = {
  [BORIS_ACTIONS.SET_BORIS]: borisSet,
};
