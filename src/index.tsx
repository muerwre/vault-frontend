import * as React from 'react';
import { render } from 'react-dom';
import { App } from '~/containers/App';
import '~/styles/main.scss';
import { getMOBXStore } from '~/store';
import { StoreContextProvider } from '~/utils/context/StoreContextProvider';

const mobxStore = getMOBXStore();

render(
  <StoreContextProvider store={mobxStore}>
    <App />
  </StoreContextProvider>,
  document.getElementById('app')
);
