import { IUser } from '~/types/auth';
import { EMPTY_USER } from '~/constants/auth';
import { makeAutoObservable } from 'mobx';
import { makePersistable, isHydrated } from 'mobx-persist-store';

export class AuthStore {
  token: string = '';
  user: IUser = EMPTY_USER;
  private isTesterInternal: boolean = false;

  constructor() {
    makeAutoObservable(this);

    void makePersistable(this, {
      name: `vault48_auth_${process.env.REACT_APP_API_URL}`,
      properties: ['token', 'user'],
      storage: window.localStorage,
    });
  }

  get isHydrated() {
    return isHydrated(this);
  }

  get isUser() {
    return !!this.token;
  }

  setUser = (user: Partial<IUser>) => {
    this.user = { ...this.user, ...user };
  };

  setToken = (token: string) => {
    this.token = token;
  };

  setIsTester = (isTester: boolean) => (this.isTesterInternal = isTester);

  get isTester() {
    return this.isUser && this.isTesterInternal;
  }

  logout = () => {
    this.token = '';
    this.setUser(EMPTY_USER);
  };
}
