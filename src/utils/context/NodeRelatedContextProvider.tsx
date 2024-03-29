import { createContext, FC, useContext } from 'react';

import { INodeRelated } from '~/types/node';

interface NodeRelatedProviderProps {
  related: INodeRelated;
  isLoading: boolean;
}

const NodeRelatedContext = createContext<NodeRelatedProviderProps>({
  related: { albums: {}, similar: [] },
  isLoading: false,
});

export const NodeRelatedContextProvider: FC<NodeRelatedProviderProps> = ({
  children,
  ...rest
}) => (
  <NodeRelatedContext.Provider value={rest}>
    {children}
  </NodeRelatedContext.Provider>
);

export const useNodeRelatedContext = () =>
  useContext<NodeRelatedProviderProps>(NodeRelatedContext);
