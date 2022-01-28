"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var material_1 = require("@mui/material");
var logo_svg_1 = __importDefault(require("../assets/logo.svg"));
function Loader() {
    return (react_1.default.createElement(material_1.Stack, { minHeight: "95vh", width: "100%", justifyContent: "center", alignItems: "center" },
        react_1.default.createElement("img", { src: logo_svg_1.default })));
}
exports.default = Loader;
//# sourceMappingURL=Loader.js.map