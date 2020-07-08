import { IState } from '../store';

export const selectBoris = (state: IState) => state.boris;
export const selectBorisStats = (state: IState) => state.boris.stats;
