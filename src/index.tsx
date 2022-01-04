import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { configureStore } from '~/redux/store';
import { App } from '~/containers/App';
import '~/styles/main.scss';
import { Store } from '~/store';
import { StoreContextProvider } from '~/utils/context/StoreContextProvider';

const { store, persistor } = configureStore();
const mobxStore = new Store();

render(
  <StoreContextProvider store={mobxStore}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StoreContextProvider>,
  document.getElementById('app')
);
