import { createStore, applyMiddleware, combineReducers, compose, Store } from 'redux';

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';
import { connectRouter, RouterState, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { PersistConfig, Persistor } from 'redux-persist/es/types';

import authReducer from '~/redux/auth/reducer';
import authSaga from '~/redux/auth/sagas';

import nodeReducer, { INodeState } from '~/redux/node/reducer';
import nodeSaga from '~/redux/node/sagas';

import flowReducer, { IFlowState } from '~/redux/flow/reducer';
import flowSaga from '~/redux/flow/sagas';

import uploadReducer, { IUploadState } from '~/redux/uploads/reducer';
import uploadSaga from '~/redux/uploads/sagas';

import playerReducer, { IPlayerState } from '~/redux/player/reducer';
import playerSaga from '~/redux/player/sagas';

import { IAuthState } from '~/redux/auth/types';

import modalReducer, { IModalState } from '~/redux/modal/reducer';
import { gotPostMessage } from './auth/actions';

const authPersistConfig: PersistConfig = {
  key: 'auth',
  whitelist: ['token', 'user'],
  storage,
};

export interface IState {
  auth: IAuthState;
  modal: IModalState;
  router: RouterState;
  node: INodeState;
  uploads: IUploadState;
  flow: IFlowState;
  player: IPlayerState;
}

export const sagaMiddleware = createSagaMiddleware();
export const history = createBrowserHistory();

const composeEnhancers =
  typeof window === 'object' && (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

export const store = createStore(
  combineReducers<IState>({
    auth: persistReducer(authPersistConfig, authReducer),
    modal: modalReducer,
    router: connectRouter(history),
    node: nodeReducer,
    uploads: uploadReducer,
    flow: flowReducer,
    player: playerReducer,
  }),
  composeEnhancers(applyMiddleware(routerMiddleware(history), sagaMiddleware))
);

export function configureStore(): { store: Store<IState>; persistor: Persistor } {
  sagaMiddleware.run(authSaga);
  sagaMiddleware.run(nodeSaga);
  sagaMiddleware.run(uploadSaga);
  sagaMiddleware.run(flowSaga);
  sagaMiddleware.run(playerSaga);

  window.addEventListener('message', message => {
    if (!message || !message.data || message.data.type !== 'oauth_login' || !message.data.token)
      return;
    store.dispatch(gotPostMessage({ token: message.data.token }));
  });

  const persistor = persistStore(store);

  return { store, persistor };
}
