import { useCallback, useEffect, useState } from 'react';
import useSWRInfinite from 'swr/infinite';
import { flatten } from 'ramda';
import { getSearchResults } from '~/redux/flow/api';
import { KeyLoader } from 'swr';
import { INode } from '~/redux/types';
import { GetSearchResultsRequest } from '~/redux/flow/types';
import { COMMENTS_DISPLAY } from '~/constants/node';

const RESULTS_COUNT = 20;

const getKey: (text: string) => KeyLoader<INode[]> = text => (pageIndex, previousPageData) => {
  if ((pageIndex > 0 && !previousPageData?.length) || !text) return null;

  const props: GetSearchResultsRequest = {
    text,
    skip: pageIndex * RESULTS_COUNT,
    take: RESULTS_COUNT,
  };

  return JSON.stringify(props);
};

export const useSearch = () => {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');

  const { data, size, setSize, mutate, isValidating } = useSWRInfinite(
    getKey(debouncedSearchText),
    async (key: string) => {
      const props: GetSearchResultsRequest = key && JSON.parse(key);

      if (!props) {
        return [] as INode[];
      }

      const result = await getSearchResults(props);

      return result.nodes;
    }
  );

  const loadMore = useCallback(() => setSize(size + 1), [setSize, size]);
  const hasMore = (data?.[size - 1]?.length || 0) >= RESULTS_COUNT;

  const results = flatten(data || []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setDebouncedSearchText(searchText.length > 2 ? searchText : '');
      await setSize(0);
      await mutate([]);
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  return {
    results,
    searchText,
    setSearchText,
    hasMore,
    loadMore,
    isLoading: isValidating,
  };
};
