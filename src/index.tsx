import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { configureStore } from '~/redux/store';
import App from '~/containers/App';

require('./styles/main.scss');

const { store, persistor } = configureStore();

render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById('app')
);

/*
- backend: exclude node covers on import
- profile modal
- profile editing
- messages
- relocate files
- import videos
- import graffiti
- password restore
- signup?
- text post can also has songs http://vault48.org/post5052

- notifications ?
- better node brief update

- social integration (assimilate)
- comment editing

Done:
- better dialogs: https://codepen.io/muemue/pen/abbEMMy
- imagecaching at backend
- social integration (login, signup)
- boris with comments (import)
- boris with comments (layout) 
  
  */
