"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_router_dom_1 = require("react-router-dom");
var material_1 = require("@mui/material");
var material_2 = require("@mui/material");
var styles_1 = require("@mui/material/styles");
var test_1 = __importDefault(require("../../components/confcall/test"));
require("../../style/spikabroadcast.scss");
var theme = (0, styles_1.createTheme)({
    palette: {
        mode: "light",
    },
});
function default_1() {
    var history = (0, react_router_dom_1.useHistory)();
    var _a = (0, react_1.useState)(false), showConfcall = _a[0], setShowConfcall = _a[1];
    return (react_1.default.createElement(styles_1.ThemeProvider, { theme: theme },
        react_1.default.createElement(material_1.Container, { component: "main", maxWidth: "xs" }, showConfcall ? (react_1.default.createElement(material_2.Box, { position: "absolute", left: "0px", top: "0px", width: "100vw", height: "100vh", overflow: "hidden" },
            react_1.default.createElement(test_1.default, { onClose: function () {
                    setShowConfcall(false);
                } }))) : (react_1.default.createElement(material_2.Box, { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" },
            react_1.default.createElement(material_1.Button, { onClick: function () {
                    setShowConfcall(true);
                } }, "Show"))))));
}
exports.default = default_1;
//# sourceMappingURL=confcall.js.map