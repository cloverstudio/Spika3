import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import App from "./app";
import "./style/app.scss";
import "./style/datePicker.scss";

import { store } from "./store/store";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

const container = document.getElementById("app");
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
    <I18nextProvider i18n={i18n}>
        <Provider store={store}>
            <App />
        </Provider>
    </I18nextProvider>,
);
