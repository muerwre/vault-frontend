import { store } from '~/redux/store';
import { playerSetStatus } from '~/redux/player/actions';
import { PLAYER_STATES } from '~/redux/player/constants';

type PlayerEventType = keyof HTMLMediaElementEventMap;

type PlayerEventListener = (
  this: HTMLAudioElement,
  event: HTMLMediaElementEventMap[keyof HTMLMediaElementEventMap]
) => void;

export class PlayerClass {
  public constructor() {
    this.element.addEventListener('timeupdate', () => {
      const { duration: total, currentTime: current } = this.element;
      const progress = (current / total) * 100;

      this.current = current || 0;
      this.total = total || 0;

      this.element.dispatchEvent(
        new CustomEvent('playprogress', {
          detail: { current, total, progress },
        })
      );
    });
  }

  public current: number = 0;

  public total: number = 0;

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

  public pause = () => {
    this.element.pause();
  };

  public getDuration = () => {
    return this.element.currentTime;
  };

  public jumpToTime = (time: number) => {
    this.element.currentTime = time;
  };

  public jumpToPercent = (percent: number) => {
    this.element.currentTime = (this.total * percent) / 100;
  };
}

const Player = new PlayerClass();

// Player.element.addEventListener('playprogress', ({ detail }: CustomEvent) => console.log(detail));

Player.on('play', () => store.dispatch(playerSetStatus(PLAYER_STATES.PLAYING)));
Player.on('pause', () => store.dispatch(playerSetStatus(PLAYER_STATES.PAUSED)));

export { Player };
