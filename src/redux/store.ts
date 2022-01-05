import { applyMiddleware, combineReducers, compose, createStore, Store } from 'redux';

import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';
import { connectRouter, routerMiddleware, RouterState } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { PersistConfig, Persistor } from 'redux-persist/es/types';

import auth from '~/redux/auth';
import authSaga from '~/redux/auth/sagas';
import { IAuthState } from '~/redux/auth/types';

import uploads, { IUploadState } from '~/redux/uploads/reducer';
import uploadSaga from '~/redux/uploads/sagas';

import player, { IPlayerState } from '~/redux/player/reducer';
import playerSaga from '~/redux/player/sagas';

import { authLogout, authOpenProfile, gotAuthPostMessage } from './auth/actions';

import messages, { IMessagesState } from './messages';
import messagesSaga from './messages/sagas';

import { AxiosError } from 'axios';
import { api } from '~/utils/api';
import { assocPath } from 'ramda';

const authPersistConfig: PersistConfig = {
  key: 'auth',
  whitelist: ['token', 'user', 'updates', 'is_tester'],
  storage,
};

const playerPersistConfig: PersistConfig = {
  key: 'player',
  whitelist: ['youtubes'],
  storage,
};

export interface IState {
  auth: IAuthState;
  router: RouterState;
  uploads: IUploadState;
  player: IPlayerState;
  messages: IMessagesState;
}

export const sagaMiddleware = createSagaMiddleware();
export const history = createBrowserHistory();

const composeEnhancers =
  typeof window === 'object' &&
  (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
  process.env.NODE_ENV === 'development'
    ? (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

export const store = createStore(
  combineReducers<IState>({
    auth: persistReducer(authPersistConfig, auth),
    router: connectRouter(history),
    uploads,
    player: persistReducer(playerPersistConfig, player),
    messages,
  }),
  composeEnhancers(applyMiddleware(routerMiddleware(history), sagaMiddleware))
);

export function configureStore(): {
  store: Store<IState>;
  persistor: Persistor;
} {
  sagaMiddleware.run(authSaga);
  sagaMiddleware.run(uploadSaga);
  sagaMiddleware.run(playerSaga);
  sagaMiddleware.run(messagesSaga);

  window.addEventListener('message', message => {
    if (message && message.data && message.data.type === 'oauth_login' && message.data.token)
      return store.dispatch(gotAuthPostMessage({ token: message.data.token }));

    if (message && message.data && message.data.type === 'username' && message.data.username)
      return store.dispatch(authOpenProfile(message.data.username));
  });

  const persistor = persistStore(store);

  // Pass token to axios
  api.interceptors.request.use(options => {
    const token = store.getState().auth.token;

    if (!token) {
      return options;
    }

    return assocPath(['headers', 'authorization'], `Bearer ${token}`, options);
  });

  // Logout on 401
  api.interceptors.response.use(undefined, (error: AxiosError<{ error: string }>) => {
    if (error.response?.status === 401) {
      store.dispatch(authLogout());
    }

    error.message = error?.response?.data?.error || error?.response?.statusText || error.message;

    throw error;
  });

  return { store, persistor };
}
