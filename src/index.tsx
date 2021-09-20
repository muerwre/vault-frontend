import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { configureStore } from '~/redux/store';
import App from '~/containers/App';
import '~/styles/main.scss';
import { SWRConfig } from 'swr';

const { store, persistor } = configureStore();

render(
  <SWRConfig
    value={{
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }}
  >
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </SWRConfig>,
  document.getElementById('app')
);
