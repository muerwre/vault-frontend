import { createReducer } from '~/utils/reducer';
import { BORIS_HANDLERS } from './handlers';

export type IStatGitRow = {
  commit: string;
  subject: string;
  timestamp: string;
};

export type IBorisState = Readonly<{
  stats: {
    git: IStatGitRow[];
  };
}>;

const BORIS_INITIAL_STATE: IBorisState = {
  stats: {
    git: [],
  },
};

export default createReducer(BORIS_INITIAL_STATE, BORIS_HANDLERS);
