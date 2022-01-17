import { makeAutoObservable } from 'mobx';
import { FlowStore } from '~/store/flow/FlowStore';
import { ModalStore } from '~/store/modal/ModalStore';
import { LabStore } from '~/store/lab/LabStore';
import { AuthStore } from '~/store/auth/AuthStore';
import { useStaticRendering } from 'mobx-react-lite';

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

// eslint-disable-next-line react-hooks/rules-of-hooks
useStaticRendering(typeof window === 'undefined');
