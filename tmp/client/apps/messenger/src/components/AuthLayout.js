"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var material_1 = require("@mui/material");
var logo_svg_1 = __importDefault(require("../assets/logo.svg"));
var login_bg_svg_1 = __importDefault(require("../assets/login-bg.svg"));
var Base_1 = __importDefault(require("./Base"));
function AuthLayout(_a) {
    var children = _a.children, _b = _a.loading, loading = _b === void 0 ? false : _b;
    return (react_1.default.createElement(Base_1.default, null,
        react_1.default.createElement(material_1.Box, { minHeight: { xs: "85vh", md: "100vh" }, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: { xs: "center", md: "start" }, sx: {
                backgroundImage: {
                    md: "url(" + login_bg_svg_1.default + ")",
                },
                backgroundPosition: "350px",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
            }, p: { xs: 2, md: 8 } }, loading ? (react_1.default.createElement(material_1.Box, { minWidth: "320px", textAlign: "center" },
            react_1.default.createElement("img", { src: logo_svg_1.default }))) : (react_1.default.createElement(material_1.Box, { py: 2, textAlign: { xs: "center", md: "left" }, maxWidth: "350px" },
            react_1.default.createElement(material_1.Box, { mb: { xs: 3, md: 4 }, display: "flex", justifyContent: { xs: "center", md: "left" }, alignItems: "center" },
                react_1.default.createElement(material_1.Box, { component: "img", src: logo_svg_1.default, width: { xs: "72px", md: "50px" } }),
                react_1.default.createElement(material_1.Typography, { ml: 1.5, display: { xs: "none", md: "block" }, component: "span", variant: "body1", fontSize: "1.15rem", fontWeight: "bold" }, "Spika")),
            children)))));
}
exports.default = AuthLayout;
//# sourceMappingURL=AuthLayout.js.map