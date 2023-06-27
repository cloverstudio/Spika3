import React from "react";
import ReactDom from "react-dom";
import { Provider } from "react-redux";

import App from "./App";
import "./style/app.scss";

import { store } from "@/store";

ReactDom.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("app")
);
