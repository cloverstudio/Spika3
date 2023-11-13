import { createRoot } from "react-dom/client";
const container = document.getElementById("app");
const root = createRoot(container);

import { Provider } from "react-redux";

import App from "./App";
import "./style/app.scss";

import { store } from "@/store";
import React from "react";

root.render(
    <Provider store={store}>
        <App />
    </Provider>,
);
