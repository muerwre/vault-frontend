import { INode } from '~/redux/types';
import { EMPTY_NODE } from '~/redux/node/constants';
import React, { createContext, FC, useContext } from 'react';

export interface NodeContextProps {
  node: INode;
  isLoading: boolean;
}

export const NodeContext = createContext<NodeContextProps>({
  node: EMPTY_NODE,
  isLoading: false,
});

export const NodeContextProvider: FC<NodeContextProps> = ({ children, ...contextValue }) => {
  return <NodeContext.Provider value={contextValue}>{children}</NodeContext.Provider>;
};

export const useNodeContext = () => useContext(NodeContext);
