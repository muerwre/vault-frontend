import git from '~/stats/git.json';
import { API } from '~/constants/api';
import { api, resultMiddleware, errorMiddleware } from '~/utils/api';
import { IBorisState, IStatBackend } from './reducer';
import { IResultWithStatus } from '../types';

export const getBorisGitStats = (): Promise<IBorisState['stats']['git']> => Promise.resolve(git);

export const getBorisBackendStats = (): Promise<IResultWithStatus<IStatBackend>> =>
  api
    .get(API.BORIS.GET_BACKEND_STATS)
    .then(resultMiddleware)
    .catch(errorMiddleware);
