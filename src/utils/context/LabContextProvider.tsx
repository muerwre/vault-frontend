import { createContext, FC, useContext } from 'react';

import { IFlowNode, ITag } from '~/types';
import { ILabNode, LabNodesSort } from '~/types/lab';

export interface LabContextProps {
  isLoading: boolean;
  nodes: ILabNode[];
  hasMore: boolean;
  loadMore: () => void;

  tags: ITag[];
  heroes: IFlowNode[];
  isLoadingStats: boolean;
  updates: IFlowNode[];
  sort: LabNodesSort;
  setSort: (sort: LabNodesSort) => void;
  search: string;
  setSearch: (val: string) => void;
}

const defaultValues: LabContextProps = {
  isLoading: false,
  nodes: [],
  hasMore: false,
  loadMore: () => {},
  tags: [],
  heroes: [],
  isLoadingStats: false,
  updates: [],
  sort: LabNodesSort.New,
  setSort: () => {},
  search: '',
  setSearch: () => {},
};

const LabContext = createContext<LabContextProps>(defaultValues);

export const LabContextProvider: FC<LabContextProps> = ({
  children,
  ...rest
}) => <LabContext.Provider value={rest}>{children}</LabContext.Provider>;

export const useLabContext = () => useContext(LabContext);
