import { makeAutoObservable } from 'mobx';

import { IFlowNode } from '~/types';

export class FlowStore {
  nodes: IFlowNode[] = [];
  heroes: IFlowNode[] = [];
  recent: IFlowNode[] = [];
  updated: IFlowNode[] = [];

  /** if store was updated after rehydration */
  isRefreshed = false;

  constructor() {
    makeAutoObservable(this);
  }

  setNodes = (nodes: IFlowNode[]) => (this.nodes = nodes);
  setHeroes = (heroes: IFlowNode[]) => (this.heroes = heroes);
  setRecent = (recent: IFlowNode[]) => (this.recent = recent);
  setUpdated = (updated: IFlowNode[]) => (this.updated = updated);

  setIsRefreshed = (refreshed: boolean) => (this.isRefreshed = refreshed);

  /** removes node from updated after user seen it */
  seenNode = (nodeId: number) => {
    this.setUpdated(this.updated.filter((node) => node.id !== nodeId));
  };

  /** replaces node with value */
  updateNode = (id: number, node: Partial<IFlowNode>) => {
    this.setNodes(
      this.nodes.map((it) => (it.id === id ? { ...it, ...node } : it)),
    );
  };
}
