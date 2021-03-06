import { IState } from '~/redux/store';

export const selectLab = (state: IState) => state.lab;
export const selectLabListNodes = (state: IState) => state.lab.list.nodes;
export const selectLabList = (state: IState) => state.lab.list;
export const selectLabStatsHeroes = (state: IState) => state.lab.stats.heroes;
export const selectLabStatsTags = (state: IState) => state.lab.stats.tags;
export const selectLabStatsLoading = (state: IState) => state.lab.stats.is_loading;
export const selectLabUpdates = (state: IState) => state.lab.updates;
export const selectLabUpdatesNodes = (state: IState) => state.lab.updates.nodes;
