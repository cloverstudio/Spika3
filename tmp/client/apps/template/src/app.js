"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_router_dom_1 = require("react-router-dom");
var index_1 = __importDefault(require("./pages/index"));
function App() {
    console.log("BASE_URL", BASE_URL);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_router_dom_1.BrowserRouter, { basename: BASE_URL },
            react_1.default.createElement(react_router_dom_1.Switch, null,
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/" },
                    react_1.default.createElement(index_1.default, null))))));
}
exports.default = App;
//# sourceMappingURL=app.js.map