import { makeAutoObservable } from 'mobx';
import { IFile } from '~/redux/types';

export class PhotoSwipeStore {
  images: IFile[] = [];
  index: number = 0;

  constructor() {
    makeAutoObservable(this);
  }

  setData = (images: IFile[], index: number) => {
    this.images = images;
    this.index = index;
  };
}
