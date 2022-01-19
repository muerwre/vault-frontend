import { makeAutoObservable } from 'mobx';
import { isHydrated, makePersistable } from 'mobx-persist-store';

import { EMPTY_USER } from '~/constants/auth';
import { IUser } from '~/types/auth';
import { CONFIG } from '~/utils/config';

export class AuthStore {
  token: string = '';
  user: IUser = EMPTY_USER;
  isTesterInternal: boolean = false;

  constructor() {
    makeAutoObservable(this);

    void makePersistable(this, {
      name: `vault48_auth_${CONFIG.apiHost}`,
      properties: ['token', 'user', 'isTesterInternal'],
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
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
