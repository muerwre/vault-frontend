import { LAB_ACTIONS } from '~/redux/lab/constants';
import { ILabState } from '~/redux/lab/types';

export const labGetList = (after?: string) => ({
  type: LAB_ACTIONS.GET_LIST,
  after,
});

export const labSetList = (list: Partial<ILabState['list']>) => ({
  type: LAB_ACTIONS.SET_LIST,
  list,
});

export const labGetStats = () => ({
  type: LAB_ACTIONS.GET_STATS,
});

export const labSetStats = (stats: Partial<ILabState['stats']>) => ({
  type: LAB_ACTIONS.SET_STATS,
  stats,
});
