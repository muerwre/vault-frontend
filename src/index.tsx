/*
  sortable grid: http://clauderic.github.io/react-sortable-hoc/#/basic-configuration/grid?_k=hjqdj1
  
  [BUGS]
  
  todo: flow hangs on empty response
  
  [CONTENT]

  todo: adding photos to comments
  todo: adding media to comments
  todo: adding media to posts
  todo: adding text to posts
  todo: covers for posts
  todo: wallpapers for posts
  todo: changing flow appearance for posts

  todo: display for all node types
  todo: related by tags
  todo: sticky left column
  todo: adaptive relates count

  todo: boris page
  todo: user profile and settings

  [IMPORT]

  todo: import users properly
  todo: auth using md5 fallback
  todo: import files properly
  todo: import nodes properly
  todo: import comments properly
  todo: convert comment content properly
  todo: convert post text properly

  [NOT TODAY]

  todo: swipable image slideshow
  todo: notifications
  todo: PMs
  todo: 

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
