import {
  createStore, applyMiddleware, combineReducers, compose, Store
} from 'redux';

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

import uploadReducer, { IUploadState } from '~/redux/uploads/reducer';
import uploadSaga from '~/redux/uploads/sagas';

import { IAuthState } from '~/redux/auth/types';

import modalReducer, { IModalState } from '~/redux/modal/reducer';

const authPersistConfig: PersistConfig = {
  key: 'auth',
  whitelist: ['token', 'user'],
  storage
};

export interface IState {
  auth: IAuthState;
  modal: IModalState;
  router: RouterState;
  node: INodeState;
  uploads: IUploadState;
}

export const sagaMiddleware = createSagaMiddleware();
export const history = createBrowserHistory();

const composeEnhancers = typeof window === 'object' && (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
  : compose;

export const store = createStore(
  combineReducers<IState>({
    auth: persistReducer(authPersistConfig, authReducer),
    modal: modalReducer,
    router: connectRouter(history),
    node: nodeReducer,
    uploads: uploadReducer,
  }),
  composeEnhancers(applyMiddleware(routerMiddleware(history), sagaMiddleware))
);

export function configureStore(): { store: Store<IState>; persistor: Persistor } {
  sagaMiddleware.run(authSaga);
  sagaMiddleware.run(nodeSaga);
  sagaMiddleware.run(uploadSaga);

  const persistor = persistStore(store);

  return { store, persistor };
}
