import { makeAutoObservable } from 'mobx';

import { Dialog } from '~/constants/modal';
import { DialogContentProps } from '~/hooks/modal/useModal';

export class ModalStore {
  current: Dialog | null = null;
  props: object | undefined;

  constructor() {
    makeAutoObservable(this);
  }

  setCurrent = <T extends Dialog>(current: T, props: DialogContentProps[T]) => {
    this.props = current ? props : {};
    this.current = current;
  };

  hide = () => {
    this.current = null;
    this.props = {};
  };
}
