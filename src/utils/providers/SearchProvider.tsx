import { createContext, FC, useContext } from 'react';

import { useSearch } from '~/hooks/search/useSearch';
import { INode } from '~/types';

export interface SearchContextProps {
  searchText: string;
  hasMore: boolean;
  searchIsLoading: boolean;
  searchResults: INode[];
  setSearchText: (text: string) => void;
  loadMore: () => void;
}

export const SearchContext = createContext<SearchContextProps>({
  searchText: '',
  hasMore: false,
  searchIsLoading: false,
  searchResults: [],
  setSearchText: () => {},
  loadMore: () => {},
});

export const SearchProvider: FC = ({ children }) => {
  const { results, searchText, isLoading, loadMore, setSearchText, hasMore } =
    useSearch();

  return (
    <SearchContext.Provider
      value={{
        searchText,
        searchResults: results,
        searchIsLoading: isLoading,
        hasMore,
        setSearchText,
        loadMore,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => useContext(SearchContext);
