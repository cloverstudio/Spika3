"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var material_1 = require("@mui/material");
var messages_media_png_1 = __importDefault(require("../../../../../../documents/pages/messages_media.png"));
var styles_1 = require("@mui/material/styles");
var theme = (0, styles_1.createTheme)({
    palette: {
        mode: "light",
    },
});
function default_1() {
    return (react_1.default.createElement(styles_1.ThemeProvider, { theme: theme },
        react_1.default.createElement(material_1.Box, null,
            react_1.default.createElement(material_1.Grid, { item: true, xs: 12, md: 12 },
                react_1.default.createElement("img", { src: messages_media_png_1.default, className: "mock" })))));
}
exports.default = default_1;
//# sourceMappingURL=messageMedia.js.map