import { makeAutoObservable } from 'mobx';
import { FlowStore } from '~/store/flow/FlowStore';
import { ModalStore } from '~/store/modal/ModalStore';
import { PhotoSwipeStore } from '~/store/photoSwipe/PhotoSwipeStore';
import { LabStore } from '~/store/lab/LabStore';

export class Store {
  flow = new FlowStore();
  modal = new ModalStore();
  photoSwipe = new PhotoSwipeStore();
  lab = new LabStore();

  constructor() {
    makeAutoObservable(this);
  }
}

const defaultStore = new Store();

export const getMOBXStore = () => defaultStore;
