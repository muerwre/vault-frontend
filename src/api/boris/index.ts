import { API } from '~/constants/api';
import { api, cleanResult } from '~/utils/api';
import { IGetGithubIssuesResult, StatBackend } from '~/types/boris';
import axios from 'axios';

export const getBorisBackendStats = () =>
  api.get<StatBackend>(API.BORIS.GET_BACKEND_STATS).then(cleanResult);

export const getGithubIssues = () => {
  return axios
    .get<IGetGithubIssuesResult>(API.BORIS.GITHUB_ISSUES, {
      params: { state: 'all', sort: 'created' },
    })
    .then(result => result.data)
    .catch(() => []);
};
