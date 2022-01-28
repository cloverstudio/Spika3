"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_router_dom_1 = require("react-router-dom");
var login_1 = __importDefault(require("./pages/login"));
var index_1 = __importDefault(require("./pages/dashboard/index"));
var index_2 = __importDefault(require("./pages/user/index"));
var add_1 = __importDefault(require("./pages/user/add"));
var detail_1 = __importDefault(require("./pages/user/detail"));
var edit_1 = __importDefault(require("./pages/user/edit"));
var delete_1 = __importDefault(require("./pages/user/delete"));
var index_3 = __importDefault(require("./pages/device/index"));
var add_2 = __importDefault(require("./pages/device/add"));
var detail_2 = __importDefault(require("./pages/device/detail"));
var edit_2 = __importDefault(require("./pages/device/edit"));
var delete_2 = __importDefault(require("./pages/device/delete"));
var index_4 = __importDefault(require("./pages/room/index"));
var add_3 = __importDefault(require("./pages/room/add"));
var detail_3 = __importDefault(require("./pages/room/detail"));
var edit_3 = __importDefault(require("./pages/room/edit"));
var delete_3 = __importDefault(require("./pages/room/delete"));
function App() {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_router_dom_1.BrowserRouter, { basename: BASE_URL },
            react_1.default.createElement(react_router_dom_1.Switch, null,
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/" },
                    react_1.default.createElement(login_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/dashboard" },
                    react_1.default.createElement(index_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/user" },
                    react_1.default.createElement(index_2.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/user/add" },
                    react_1.default.createElement(add_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/user/detail/:id" },
                    react_1.default.createElement(detail_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/user/edit/:id" },
                    react_1.default.createElement(edit_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/user/delete/:id" },
                    react_1.default.createElement(delete_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/user/:id/devices" },
                    react_1.default.createElement(index_3.default, { key: "user_devices" })),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/user/:userId/room" },
                    react_1.default.createElement(index_4.default, { key: "user_rooms" })),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/device" },
                    react_1.default.createElement(index_3.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/device/add" },
                    react_1.default.createElement(add_2.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/device/detail/:id" },
                    react_1.default.createElement(detail_2.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/device/edit/:id" },
                    react_1.default.createElement(edit_2.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/device/delete/:id" },
                    react_1.default.createElement(delete_2.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/room" },
                    react_1.default.createElement(index_4.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/room/add" },
                    react_1.default.createElement(add_3.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/room/detail/:id" },
                    react_1.default.createElement(detail_3.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/room/edit/:id" },
                    react_1.default.createElement(edit_3.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/room/delete/:id" },
                    react_1.default.createElement(delete_3.default, null))))));
}
exports.default = App;
//# sourceMappingURL=app.js.map