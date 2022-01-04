import { makeAutoObservable } from 'mobx';
import { FlowStore } from '~/store/flow/FlowStore';

export class Store {
  flow = new FlowStore();

  constructor() {
    makeAutoObservable(this);
  }
}
