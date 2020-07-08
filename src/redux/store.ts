import { createStore, applyMiddleware, combineReducers, compose, Store } from 'redux';

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';
import { connectRouter, RouterState, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { PersistConfig, Persistor } from 'redux-persist/es/types';

import auth from '~/redux/auth/reducer';
import authSaga from '~/redux/auth/sagas';
import { IAuthState } from '~/redux/auth/types';

import node, { INodeState } from '~/redux/node/reducer';
import nodeSaga from '~/redux/node/sagas';

import flow, { IFlowState } from '~/redux/flow/reducer';
import flowSaga from '~/redux/flow/sagas';

import uploads, { IUploadState } from '~/redux/uploads/reducer';
import uploadSaga from '~/redux/uploads/sagas';

import player, { IPlayerState } from '~/redux/player/reducer';
import playerSaga from '~/redux/player/sagas';

import modal, { IModalState } from '~/redux/modal/reducer';
import { modalSaga } from './modal/sagas';

import { gotAuthPostMessage, authOpenProfile } from './auth/actions';

import boris, { IBorisState } from './boris/reducer';
import borisSaga from './boris/sagas';

const authPersistConfig: PersistConfig = {
  key: 'auth',
  whitelist: ['token', 'user', 'updates'],
  storage,
};

const flowPersistConfig: PersistConfig = {
  key: 'flow',
  whitelist: ['nodes', 'recent', 'updated'],
  storage,
};

const playerPersistConfig: PersistConfig = {
  key: 'player',
  whitelist: ['youtubes'],
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
  boris: IBorisState;
}

export const sagaMiddleware = createSagaMiddleware();
export const history = createBrowserHistory();

const composeEnhancers =
  typeof window === 'object' && (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

export const store = createStore(
  combineReducers<IState>({
    auth: persistReducer(authPersistConfig, auth),
    modal,
    boris,
    router: connectRouter(history),
    node,
    uploads,
    flow: persistReducer(flowPersistConfig, flow),
    player: persistReducer(playerPersistConfig, player),
  }),
  composeEnhancers(applyMiddleware(routerMiddleware(history), sagaMiddleware))
);

export function configureStore(): {
  store: Store<IState>;
  persistor: Persistor;
} {
  sagaMiddleware.run(authSaga);
  sagaMiddleware.run(nodeSaga);
  sagaMiddleware.run(uploadSaga);
  sagaMiddleware.run(flowSaga);
  sagaMiddleware.run(playerSaga);
  sagaMiddleware.run(modalSaga);
  sagaMiddleware.run(borisSaga);

  window.addEventListener('message', message => {
    if (message && message.data && message.data.type === 'oauth_login' && message.data.token)
      return store.dispatch(gotAuthPostMessage({ token: message.data.token }));

    if (message && message.data && message.data.type === 'username' && message.data.username)
      return store.dispatch(authOpenProfile(message.data.username));
  });

  const persistor = persistStore(store);

  return { store, persistor };
}
