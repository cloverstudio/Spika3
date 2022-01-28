"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.participants = exports.me = void 0;
var react_1 = __importDefault(require("react"));
var material_1 = require("@mui/material");
var styles_1 = require("@mui/material/styles");
exports.me = {
    user: {
        displayName: "Vedran",
        avatarUrl: "",
    },
    videoEnabled: true,
    audioEnabled: true,
};
var participant1 = {
    user: {
        displayName: "Ken",
        avatarUrl: "",
    },
    videoEnabled: true,
    audioEnabled: true,
};
var participant2 = {
    user: {
        displayName: "Yumiko",
        avatarUrl: "",
    },
    videoEnabled: false,
    audioEnabled: true,
};
var participant3 = {
    user: {
        displayName: "Mislav",
        avatarUrl: "",
    },
    videoEnabled: true,
    audioEnabled: true,
};
var participant4 = {
    user: {
        displayName: "Ivo",
        avatarUrl: "",
    },
    videoEnabled: true,
    audioEnabled: true,
};
exports.participants = [
    participant1,
    participant2,
    participant3,
    participant4,
    participant4,
    participant4,
    participant4,
];
var theme = (0, styles_1.createTheme)({
    palette: {
        mode: "light",
    },
});
function default_1() {
    return (react_1.default.createElement(styles_1.ThemeProvider, { theme: theme },
        react_1.default.createElement(material_1.Box, null,
            react_1.default.createElement(material_1.Grid, { item: true, xs: 12, md: 12 }, "ssdd"))));
}
exports.default = default_1;
//# sourceMappingURL=confcall.js.map