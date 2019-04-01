import { createStore, applyMiddleware, combineReducers, compose, Store } from 'redux';

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';
import { connectRouter } from 'connected-react-router'
import userReducer from '$redux/user/reducer';
import userSaga from '$redux/user/sagas';
import { createBrowserHistory } from 'history';
import { PersistConfig, Persistor } from "redux-persist/es/types";
import { routerMiddleware } from 'connected-react-router'

const userPersistConfig: PersistConfig = {
  key: 'user',
  whitelist: ['user', 'logo', 'provider', 'speed'],
  storage,
};

export const sagaMiddleware = createSagaMiddleware();
export const history = createBrowserHistory();

const composeEnhancers =
  typeof window === 'object' &&
  (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

export const store = createStore(
  combineReducers({
    user: persistReducer(userPersistConfig, userReducer),
    router: connectRouter(history),
  }),
  composeEnhancers(applyMiddleware(
    routerMiddleware(history),
    sagaMiddleware
  ))
);

export function configureStore(): { store: Store<any>, persistor: Persistor } {
  sagaMiddleware.run(userSaga);

  const persistor = persistStore(store);

  return { store, persistor };
}
