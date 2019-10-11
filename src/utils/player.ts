// import { Howl } from 'howler';
// import { store } from '~/redux/store';

// export const Player: HTMLAudioElement = new Audio();
//
// console.log(Player);

export class PlayerClass {
  public constructor() {
    this.element.addEventListener('timeupdate', () => {
      const { duration: total, currentTime: current } = this.element;
      const progress = (current / total) * 100;

      this.element.dispatchEvent(
        new CustomEvent('playprogress', {
          detail: { current, total, progress },
        })
      );
    });
  }

  public element: HTMLAudioElement = new Audio();

  public duration: number = 0;

  public set = (src: string): void => {
    this.element.src = src;
  };

  public on = (type: string, callback) => {
    this.element.addEventListener(type, callback);
  };

  public off = (type: string, callback) => {
    this.element.removeEventListener(type, callback);
  };

  public load = () => {
    this.element.load();
  };

  public play = () => {
    this.element.play();
  };

  public getDuration = () => {
    return this.element.currentTime;
  };
}

const Player = new PlayerClass();

Player.element.addEventListener('playprogress', ({ detail }: CustomEvent) => console.log(detail));

export { Player };
