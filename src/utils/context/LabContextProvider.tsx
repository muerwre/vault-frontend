import { ILabNode } from '~/redux/lab/types';
import React, { createContext, FC, useContext } from 'react';
import { INode, ITag } from '~/redux/types';

export interface LabContextProps {
  isLoading: boolean;
  nodes: ILabNode[];
  count: number;
  onLoadMore: () => void;

  tags: ITag[];
  heroes: Partial<INode>[];
  isLoadingStats: boolean;
  updates: Partial<INode>[];
}

const defaultValues: LabContextProps = {
  isLoading: false,
  nodes: [],
  count: 0,
  onLoadMore: () => {},
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
