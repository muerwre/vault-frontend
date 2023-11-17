import axios from 'axios';

import { API } from '~/constants/api';
import { IGetGithubIssuesResult, StatBackend } from '~/types/boris';
import { api, unwrap } from '~/utils/api';

export const getBorisBackendStats = () =>
  api.get<StatBackend>(API.BORIS.GET_BACKEND_STATS).then(unwrap);

export const getGithubIssues = () => {
  return axios
    .get<IGetGithubIssuesResult>(API.BORIS.GITHUB_ISSUES, {
      params: { state: 'all', sort: 'created' },
    })
    .then(unwrap)
    .catch(() => []);
};
