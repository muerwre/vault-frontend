import * as React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { configureStore } from "~/redux/store";
import App from "~/containers/App";

require("./styles/main.scss");

const { store, persistor } = configureStore();

render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById("app")
);

/*

- fix: text nodes cell not clickable
- fix: text nodes cell has no preview
- fix: text nodes should not have 'no comments yet badge

- import videos
- import graffiti
- password restore
- signup?
- text post can also has songs http://vault48.org/post5052
- fulltext search: https://github.com/typeorm/typeorm/issues/3191
- zoom: https://manuelstofer.github.io/pinchzoom/

- notifications (node, comment)
- better node brief update

- social integration (assimilate)
- comment editing
- fulltext https://github.com/typeorm/typeorm/issues/3191

Done:
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

*/
