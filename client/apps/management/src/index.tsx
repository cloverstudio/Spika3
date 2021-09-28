import React from "react";
import ReactDom from "react-dom";

import App from "./app";
import "./style/app.scss";

import { store } from "./store/store";
import { Provider } from "react-redux";

ReactDom.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app")
);
