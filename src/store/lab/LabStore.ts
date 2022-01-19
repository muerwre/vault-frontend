import { makeAutoObservable } from 'mobx';

import { IFlowNode, ITag } from '~/types';
import { ILabNode } from '~/types/lab';

export class LabStore {
  // actual nodes
  nodes: ILabNode[] = [];

  // stats
  heroes: IFlowNode[] = [];
  tags: ITag[] = [];
  updates: IFlowNode[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setNodes = (nodes: ILabNode[]) => (this.nodes = nodes);
  setHeroes = (heroes: IFlowNode[]) => (this.heroes = heroes);
  setTags = (tags: ITag[]) => (this.tags = tags);
  setUpdates = (updates: IFlowNode[]) => (this.updates = updates);
}
