import { makeAutoObservable } from 'mobx';
import { FlowStore } from '~/store/flow/FlowStore';
import { ModalStore } from '~/store/modal/ModalStore';
import { LabStore } from '~/store/lab/LabStore';
import { AuthStore } from '~/store/auth/AuthStore';
import { enableStaticRendering, useStaticRendering } from 'mobx-react-lite';

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
