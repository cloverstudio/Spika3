"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_dom_1 = __importDefault(require("react-dom"));
var app_1 = __importDefault(require("./app"));
require("./style/app.scss");
var store_1 = require("./store/store");
var react_redux_1 = require("react-redux");
react_dom_1.default.render(react_1.default.createElement(react_redux_1.Provider, { store: store_1.store },
    react_1.default.createElement(app_1.default, null)), document.getElementById("app"));
//# sourceMappingURL=index.js.map