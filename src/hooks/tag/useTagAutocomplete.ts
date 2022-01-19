import { useEffect, useMemo, useState } from 'react';

import useSWR from 'swr';

import { apiGetTagSuggestions } from '~/api/tags';
import { API } from '~/constants/api';

export const useTagAutocomplete = (input: string, exclude: string[]): string[] => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(input), 200);
    return () => clearTimeout(timeout);
  }, [input]);

  const { data } = useSWR(
    `${API.TAG.AUTOCOMPLETE}?tag=${search}&exclude=${exclude.join(',')}`,
    async () => {
      const result = await apiGetTagSuggestions({ search, exclude });
      return result.tags || [];
    }
  );

  return useMemo(() => data || [], [data]);
};
