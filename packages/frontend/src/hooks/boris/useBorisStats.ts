import useSWR from 'swr';

import { getBorisBackendStats, getGithubIssues } from '~/api/boris';
import { API } from '~/constants/api';
import { initialBackendStats } from '~/constants/boris/constants';
import { BorisUsageStats } from '~/types/boris';

export const useBorisStats = () => {
  const {
    data: backend = initialBackendStats,
    isValidating: isValidatingBackend,
  } = useSWR(API.BORIS.GET_BACKEND_STATS, () => getBorisBackendStats());

  const { data: issues = [] } = useSWR(API.BORIS.GITHUB_ISSUES, () =>
    getGithubIssues(),
  );

  const stats: BorisUsageStats = {
    backend,
    issues,
  };

  const isLoading = !backend && isValidatingBackend;

  return { stats, isLoading };
};
