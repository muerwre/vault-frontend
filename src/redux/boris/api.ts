import git from '~/stats/git.json';
import { API } from '~/constants/api';
import { api, cleanResult } from '~/utils/api';
import { IBorisState, IStatBackend } from './reducer';
import axios from 'axios';
import { IGetGithubIssuesResult } from '~/redux/boris/types';

export const getBorisGitStats = () => Promise.resolve<IBorisState['stats']['git']>(git);

export const getBorisBackendStats = () =>
  api.get<IStatBackend>(API.BORIS.GET_BACKEND_STATS).then(cleanResult);

export const getGithubIssues = () => {
  return axios
    .get<IGetGithubIssuesResult>('https://api.github.com/repos/muerwre/vault-frontend/issues', {
      params: { state: 'all', sort: 'created' },
    })
    .then(result => result.data)
    .catch(() => []);
};
