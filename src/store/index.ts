import { makeAutoObservable } from 'mobx';
import { enableStaticRendering } from 'mobx-react-lite';

import { AuthStore } from '~/store/auth/AuthStore';
import { FlowStore } from '~/store/flow/FlowStore';
import { LabStore } from '~/store/lab/LabStore';
import { ModalStore } from '~/store/modal/ModalStore';

export class Store {
  flow = new FlowStore();
  modal = new ModalStore();
  lab = new LabStore();
  auth = new AuthStore();

  constructor() {
    makeAutoObservable(this);
  }

  get isHydrated() {
    return this.auth.isHydrated;
  }
}

const defaultStore = new Store();

export const getMOBXStore = () => defaultStore;

enableStaticRendering(typeof window === 'undefined');
