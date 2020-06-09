import { IBorisState } from './reducer';
import { BORIS_ACTIONS } from './constants';

const borisSet = (current: IBorisState, { state }: ReturnType<typeof borisSet>) => ({
  ...current,
  ...state,
});

const borisSetStats = (state: IBorisState, { stats }: ReturnType<typeof borisSetStats>) => ({
  ...state,
  stats: {
    ...state.stats,
    ...stats,
  },
});

export const BORIS_HANDLERS = {
  [BORIS_ACTIONS.SET_BORIS]: borisSet,
  [BORIS_ACTIONS.SET_STATS]: borisSetStats,
};
