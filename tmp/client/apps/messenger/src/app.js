"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_router_dom_1 = require("react-router-dom");
var mocks_1 = __importDefault(require("./pages/mocks"));
var chat_1 = __importDefault(require("./pages/mocks/chat"));
var chatMedialist_1 = __importDefault(require("./pages/mocks/chatMedialist"));
var chatNomessageUserList_1 = __importDefault(require("./pages/mocks/chatNomessageUserList"));
var chatNomessage_1 = __importDefault(require("./pages/mocks/chatNomessage"));
var chatSmallSidebar_1 = __importDefault(require("./pages/mocks/chatSmallSidebar"));
var groupDetail_1 = __importDefault(require("./pages/mocks/groupDetail"));
var messageMedia_1 = __importDefault(require("./pages/mocks/messageMedia"));
var noChat_1 = __importDefault(require("./pages/mocks/noChat"));
var userLIst_1 = __importDefault(require("./pages/mocks/userLIst"));
var conferenceCallView_1 = __importDefault(require("./pages/mocks/conferenceCallView"));
var confcall_1 = __importDefault(require("./pages/mocks/confcall"));
var auth_1 = __importDefault(require("./pages/auth"));
var app_1 = __importDefault(require("./pages/app"));
var confcall_2 = __importDefault(require("./pages/app/confcall"));
function App() {
    console.log("BASE_URL", BASE_URL);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_router_dom_1.BrowserRouter, { basename: BASE_URL },
            react_1.default.createElement(react_router_dom_1.Switch, null,
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/" },
                    react_1.default.createElement(mocks_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/mock/chat" },
                    react_1.default.createElement(chat_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/mock/chat_medialist" },
                    react_1.default.createElement(chatMedialist_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/mock/chat_nomessage_userlist" },
                    react_1.default.createElement(chatNomessageUserList_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/mock/chat_nomessage" },
                    react_1.default.createElement(chatNomessage_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/mock/chat_small_sidebar" },
                    react_1.default.createElement(chatSmallSidebar_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/mock/groupdetail" },
                    react_1.default.createElement(groupDetail_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/mock/message_media" },
                    react_1.default.createElement(messageMedia_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/mock/nochat" },
                    react_1.default.createElement(noChat_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/mock/userlist" },
                    react_1.default.createElement(userLIst_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/mock/conferenceCallView" },
                    react_1.default.createElement(conferenceCallView_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/auth" },
                    react_1.default.createElement(auth_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/mock/confcall" },
                    react_1.default.createElement(confcall_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/app" },
                    react_1.default.createElement(app_1.default, null)),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/conftest" },
                    react_1.default.createElement(confcall_2.default, null))))));
}
exports.default = App;
//# sourceMappingURL=app.js.map