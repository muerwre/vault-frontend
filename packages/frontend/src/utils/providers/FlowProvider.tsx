import { createContext, FC, useContext, useMemo } from 'react';

import { observer } from 'mobx-react-lite';

import { useFlow } from '~/hooks/flow/useFlow';
import { FlowDisplay, IFlowNode, INode } from '~/types';
import { GetNodeDiffResult } from '~/types/node';
import { uniq } from '~/utils/ramda';

export interface FlowProviderProps {
  fallbackData?: GetNodeDiffResult;
}

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

export const FlowProvider: FC<FlowProviderProps> = observer(
  ({ fallbackData, children }) => {
    const flow = useFlow();

    const value = useMemo<FlowContextProps>(() => {
      if (!flow.nodes?.length && fallbackData) {
        return {
          ...flow,
          heroes: fallbackData.heroes || [],
          updates: fallbackData.updated || [],
          recent: fallbackData.recent || [],
          nodes: uniq([
            ...(fallbackData.before || []),
            ...(fallbackData.after || []),
          ]),
        };
      }

      return {
        ...flow,
        heroes: fallbackData?.heroes?.length
          ? fallbackData.heroes
          : flow.heroes,
      };
    }, [flow, fallbackData]);

    return (
      <FlowContext.Provider value={value}>{children}</FlowContext.Provider>
    );
  },
);

export const useFlowContext = () => useContext(FlowContext);
