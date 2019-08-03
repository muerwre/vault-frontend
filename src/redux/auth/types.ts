export interface IToken {
  access: string;
  refresh: string;
}

export interface IUser {
  id: number;
  username: string;
  email: string;
  role: string;
  photo: string;
  name: string;

  is_activated: boolean;
  is_user: boolean;
}

export type IAuthState = Readonly<{
  user: IUser;
  token: IToken;

  login: {
    error: string;
    is_loading: boolean;
  };
}>;
