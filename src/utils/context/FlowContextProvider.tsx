import React, { createContext, FC, useContext } from 'react';
import { FlowDisplay, IFlowNode, INode } from '~/types';

export interface FlowContextProps {
  updates: IFlowNode[];
  recent: IFlowNode[];
  heroes: IFlowNode[];
  nodes: IFlowNode[];
  isSyncing: boolean;
  loadMore: () => Promise<unknown>;
  onChangeCellView: (id: INode['id'], flow: FlowDisplay) => void;
}

export const FlowContext = createContext<FlowContextProps>({
  updates: [],
  recent: [],
  heroes: [],
  nodes: [],
  isSyncing: false,
  loadMore: async () => {},

  onChangeCellView: () => {},
});

export const FlowContextProvider: FC<FlowContextProps> = ({ children, ...contextValue }) => {
  return <FlowContext.Provider value={contextValue}>{children}</FlowContext.Provider>;
};

export const useFlowContext = () => useContext(FlowContext);
