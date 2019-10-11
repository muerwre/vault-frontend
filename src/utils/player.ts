import { Howl } from 'howler';

Howl.prototype.setSrc = function setSrc(src) {
  this.unload();
  this._src = src;
  this.load();
  this.play();
};

export const Player = new Howl({ src: [''] });
