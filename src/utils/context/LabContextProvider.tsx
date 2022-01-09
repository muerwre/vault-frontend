import { ILabNode } from '~/types/lab';
import React, { createContext, FC, useContext } from 'react';
import { IFlowNode, ITag } from '~/types';

export interface LabContextProps {
  isLoading: boolean;
  nodes: ILabNode[];
  hasMore: boolean;
  loadMore: () => void;

  tags: ITag[];
  heroes: IFlowNode[];
  isLoadingStats: boolean;
  updates: IFlowNode[];
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
};

const LabContext = createContext<LabContextProps>(defaultValues);

export const LabContextProvider: FC<LabContextProps> = ({ children, ...rest }) => (
  <LabContext.Provider value={rest}>{children}</LabContext.Provider>
);

export const useLabContext = () => useContext(LabContext);
