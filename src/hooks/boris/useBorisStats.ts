import useSWR from 'swr';
import { API } from '~/constants/api';
import { getBorisBackendStats, getGithubIssues } from '~/api/boris';
import { BorisUsageStats } from '~/types/boris';
import { initialBackendStats } from '~/constants/boris/constants';

export const useBorisStats = () => {
  const { data: backend = initialBackendStats, isValidating: isValidatingBackend } = useSWR(
    API.BORIS.GET_BACKEND_STATS,
    () => getBorisBackendStats()
  );

  const { data: issues = [] } = useSWR(API.BORIS.GITHUB_ISSUES, () => getGithubIssues());

  const stats: BorisUsageStats = {
    backend,
    issues,
  };

  const isLoading = !backend && isValidatingBackend;

  return { stats, isLoading };
};
