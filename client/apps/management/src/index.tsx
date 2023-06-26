import React from "react";
import { createRoot } from "react-dom/client";

import { Provider } from "react-redux";
import App from "./App";
import "./style/app.scss";

import { store } from "./store";

const container = document.getElementById("app");
const root = createRoot(container);

root.render(
    <Provider store={store}>
        <App />
    </Provider>
);
