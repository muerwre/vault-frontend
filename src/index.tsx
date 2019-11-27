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

  [Stage 0]:
  - set file target on comment save, node save, profile upload
  - check if email is registered at social login
  - profile cover upload
  - user access time update
  - delete comments
  - delete nodes
  
  - illustrate 404
  - illustrate restoreRequestDialog
  - illustrate login  
  
  [stage 1]
  - friendship
  - signup?
  - import videos
  - text post can also has songs http://vault48.org/post5052
  - fulltext search: https://github.com/typeorm/typeorm/issues/3191
  - zoom: https://manuelstofer.github.io/pinchzoom/
  
  - notifications (node, comment)
  
  - social integration (assimilate)
  - comment editing
  
  Done:
  - import graffiti
  - <...> format
  - youtube embeds
  - mobile header
  - sticky header
  - password restore
  - avatar upload
  - flow updates
  - flow infinite scroll
  - better node brief update
  - fix: text nodes cell has no preview (actually, that's a problem of brief)
  - relocate files
  - backend: exclude node covers on import
  - profile editing
  - notifications (messages)
  - profile modal
  - messages
  - better dialogs: https://codepen.io/muemue/pen/abbEMMy
  - imagecaching at backend
  - social integration (login, signup)
  - boris with comments (import)
  - boris with comments (layout) 
  - fix: user receives his own notifications :-(
  - fix: node related and albums should exclude node itself
  - fix: select node and edit it. All images will be not loaded
  - fix: text nodes cell not clickable
  - fix: text nodes should not have 'no comments yet badge
*/
