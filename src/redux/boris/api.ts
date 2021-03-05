import git from '~/stats/git.json';
import { API } from '~/constants/api';
import { api, resultMiddleware, errorMiddleware, cleanResult } from '~/utils/api';
import { IBorisState, IStatBackend } from './reducer';
import { IResultWithStatus } from '../types';

export const getBorisGitStats = () => Promise.resolve<IBorisState['stats']['git']>(git);

export const getBorisBackendStats = () =>
  api.get<IStatBackend>(API.BORIS.GET_BACKEND_STATS).then(cleanResult);
