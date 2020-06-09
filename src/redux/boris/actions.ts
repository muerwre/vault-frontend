import { IBorisState } from './reducer';
import { BORIS_ACTIONS } from './constants';

export const borisSet = (state: Partial<IBorisState>) => ({
  type: BORIS_ACTIONS.SET_BORIS,
  state,
});

export const borisSetStats = (stats: Partial<IBorisState['stats']>) => ({
  type: BORIS_ACTIONS.SET_STATS,
  stats,
});

export const borisLoadStats = () => ({
  type: BORIS_ACTIONS.LOAD_STATS,
});
