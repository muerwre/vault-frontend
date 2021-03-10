import { createReducer } from '~/utils/reducer';
import { BORIS_HANDLERS } from './handlers';
import { IGithubIssue } from '~/redux/boris/types';

export type IStatGitRow = {
  commit: string;
  subject: string;
  timestamp: string;
};

export type IStatBackend = {
  users: {
    total: number;
    alive: number;
  };
  nodes: {
    images: number;
    audios: number;
    videos: number;
    texts: number;
    total: number;
  };
  comments: {
    total: number;
  };
  files: {
    count: number;
    size: number;
  };
};

export type IBorisState = Readonly<{
  stats: {
    git: Partial<IStatGitRow>[];
    issues: IGithubIssue[];
    backend?: IStatBackend;
    is_loading: boolean;
  };
}>;

const BORIS_INITIAL_STATE: IBorisState = {
  stats: {
    git: [],
    issues: [],
    backend: undefined,
    is_loading: false,
  },
};

export default createReducer(BORIS_INITIAL_STATE, BORIS_HANDLERS);
