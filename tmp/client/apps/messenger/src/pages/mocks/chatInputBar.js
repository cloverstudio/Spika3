"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var styles_1 = require("@mui/material/styles");
var material_1 = require("@mui/material");
var ControlPoint_1 = __importDefault(require("@mui/icons-material/ControlPoint"));
var SentimentSatisfiedRounded_1 = __importDefault(require("@mui/icons-material/SentimentSatisfiedRounded"));
var theme = (0, styles_1.createTheme)({
    palette: {
        mode: "light",
    },
});
var ChatInputBar = function () {
    return (react_1.default.createElement(styles_1.ThemeProvider, { theme: theme },
        react_1.default.createElement(material_1.Box, { height: "2.5em", ml: "1em", mr: "1em", borderColor: "black", borderRadius: "0.2em", sx: { borderWidth: "1px", borderStyle: "double" } },
            react_1.default.createElement(material_1.Stack, { alignItems: "center", spacing: 1, direction: "row" },
                react_1.default.createElement(ControlPoint_1.default, null),
                react_1.default.createElement(material_1.InputBase, { sx: { width: "95%", borderStyle: "none" }, placeholder: "Type here...", inputProps: { style: { fontSize: 12 } } }),
                react_1.default.createElement(SentimentSatisfiedRounded_1.default, null)))));
};
exports.default = ChatInputBar;
//# sourceMappingURL=chatInputBar.js.map