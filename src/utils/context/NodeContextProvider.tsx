import React, { createContext, FC, useContext } from 'react';

import { EMPTY_NODE } from '~/constants/node';
import { INode, NodeBackLink } from '~/types';

export interface NodeContextProps {
  node: INode;
  backlinks?: NodeBackLink[];
  update: (node: Partial<INode>) => Promise<unknown>;
  isLoading: boolean;
}

export const NodeContext = createContext<NodeContextProps>({
  node: EMPTY_NODE,
  backlinks: [] as NodeBackLink[] | undefined,
  update: async () => {},
  isLoading: false,
});

export const NodeContextProvider: FC<NodeContextProps> = ({
  children,
  ...contextValue
}) => {
  return (
    <NodeContext.Provider value={contextValue}>{children}</NodeContext.Provider>
  );
};

export const useNodeContext = () => useContext(NodeContext);
