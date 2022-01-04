import { makeAutoObservable } from 'mobx';
import { Dialog } from '~/constants/modal';

export class ModalStore {
  current: Dialog | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setCurrent = (current: Dialog | null) => (this.current = current);

  hide = () => (this.current = null);
}
