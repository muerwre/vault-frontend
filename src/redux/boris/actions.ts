import { IBorisState } from './reducer';
import { BORIS_ACTIONS } from './constants';

export const borisSet = (state: Partial<IBorisState>) => ({
  type: BORIS_ACTIONS.SET_BORIS,
  state,
});

export const borisLoadStats = () => ({
  type: BORIS_ACTIONS.LOAD_STATS,
});
