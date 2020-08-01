import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import createSore from "./reducks/store/store";
import { ConnectedRouter } from 'connected-react-router';
import * as History from 'history';
import App from './App';

const history = History.createBrowserHistory();
export const store = createSore(history)

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);
