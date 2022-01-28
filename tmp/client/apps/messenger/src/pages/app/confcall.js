"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_router_dom_1 = require("react-router-dom");
var material_1 = require("@mui/material");
var styles_1 = require("@mui/material/styles");
var confcall_1 = __importDefault(require("../../components/confcall"));
var theme = (0, styles_1.createTheme)({
    palette: {
        mode: "light",
    },
});
function default_1() {
    var history = (0, react_router_dom_1.useHistory)();
    return (react_1.default.createElement(styles_1.ThemeProvider, { theme: theme },
        react_1.default.createElement(material_1.Container, { component: "main", maxWidth: "xs" },
            react_1.default.createElement(confcall_1.default, null))));
}
exports.default = default_1;
//# sourceMappingURL=confcall.js.map