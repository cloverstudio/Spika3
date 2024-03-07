import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import App from "./app";
import "./style/app.scss";
import "./style/datePicker.scss";

import { store } from "./store/store";

const container = document.getElementById("app");
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
    <Provider store={store}>
        <App />
    </Provider>,
);
