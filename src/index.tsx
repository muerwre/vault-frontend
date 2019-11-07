/*
  sortable grid: http://clauderic.github.io/react-sortable-hoc/#/basic-configuration/grid?_k=hjqdj1
  
  [BUGS]

  FIXME: flow hangs on empty response
  
  [CONTENT]

  TODO: adding photos to comments
  TODO: adding media to comments
  TODO: adding media to posts
  TODO: adding text to posts
  TODO: covers for posts
  TODO: wallpapers for posts
  TODO: changing flow appearance for posts

  TODO: display for all node types
  TODO: related by tags
  TODO: sticky left column
  TODO: adaptive relates count

  TODO: boris page
  TODO: user profile and settings

  [IMPORT]

  TODO: import users properly
  TODO: auth using md5 fallback
  TODO: import files properly
  TODO: import nodes properly
  TODO: import comments properly
  TODO: convert comment content properly
  TODO: convert post text properly

  [NOT TODAY]

  TODO: swipable image slideshow
  TODO: notifications
  TODO: PMs
  TODO: 

*/
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
  - boris with comments (layout)
  
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
  
*/
