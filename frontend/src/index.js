import React from 'react'
import ReactDOM from 'react-dom'

import { Provider } from 'react-redux'
import { createStore } from 'redux'
import rootReducer from 'reducers'
import { createBrowserHistory } from "history";
import { Router, Route, Switch, Redirect } from "react-router-dom";

// core components
import Admin from "layouts/Admin.js";
import Whitebck from 'views/Login/Whitebck';
import ParkingSolutionQRCode from './views/Parkingsolution/ParkingSolutionQRCode'

import "assets/css/material-dashboard-react.css?v=1.9.0";
import "assets/css/fonts.css";

const hist = createBrowserHistory();
const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)
// const rootElement = document.getElementById('root')
ReactDOM.render(
  <Provider store={store}>
    <Router history={hist}>
      <Switch>
        <Route path="/admin" component={Admin} />
        <Route path="/login" component={Whitebck} />
        <Route path="/SN_QRCode" component={ParkingSolutionQRCode} />
        <Redirect from="/" to="/login" />
        {/* <Redirect from="/" to="/admin/dashboard" /> */}
      </Switch>
    </Router>
  </Provider>,
  document.getElementById("root")
)
