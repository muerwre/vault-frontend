import React, { createContext, FC, useContext } from 'react';
import { INode } from '~/redux/types';
import { useSearch } from '~/hooks/search/useSearch';

export interface SearchContextProps {
  searchText: string;
  searchTotal: number;
  searchIsLoading: boolean;
  searchResults: INode[];
  onSearchChange: (text: string) => void;
  onSearchLoadMore: () => void;
}

export const SearchContext = createContext<SearchContextProps>({
  searchText: '',
  searchTotal: 0,
  searchIsLoading: false,
  searchResults: [],
  onSearchChange: () => {},
  onSearchLoadMore: () => {},
});

export const SearchContextProvider: FC = ({ children }) => {
  const {
    search: { text, results, is_loading, total },
    onSearchLoadMore,
    onSearchChange,
  } = useSearch();

  return (
    <SearchContext.Provider
      value={{
        searchText: text,
        searchResults: results,
        searchIsLoading: is_loading,
        searchTotal: total,
        onSearchChange,
        onSearchLoadMore,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => useContext(SearchContext);
