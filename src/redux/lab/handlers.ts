import { LAB_ACTIONS } from '~/redux/lab/constants';
import { labSetList, labSetStats } from '~/redux/lab/actions';
import { ILabState } from '~/redux/lab/types';

type LabHandler<T extends (...args: any) => any> = (
  state: Readonly<ILabState>,
  payload: ReturnType<T>
) => Readonly<ILabState>;

const setList: LabHandler<typeof labSetList> = (state, { list }) => ({
  ...state,
  list: {
    ...state.list,
    ...list,
  },
});

const setStats: LabHandler<typeof labSetStats> = (state, { stats }) => ({
  ...state,
  stats: {
    ...state.stats,
    ...stats,
  },
});

export const LAB_HANDLERS = {
  [LAB_ACTIONS.SET_LIST]: setList,
  [LAB_ACTIONS.SET_STATS]: setStats,
};
