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
var material_1 = require("@mui/material");
var upload_image_svg_1 = __importDefault(require("../assets/upload-image.svg"));
function UpdateUserForm(_a) {
    var onSubmit = _a.onSubmit, error = _a.error;
    var _b = (0, react_1.useState)(""), username = _b[0], setUsername = _b[1];
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(material_1.Box, { minWidth: "320px", textAlign: "center", mb: error ? 2 : 7 },
            react_1.default.createElement("img", { src: upload_image_svg_1.default })),
        error && (react_1.default.createElement(material_1.Alert, { sx: { mb: 4 }, severity: "error" },
            react_1.default.createElement(material_1.AlertTitle, { sx: { mb: 0 } }, error.message))),
        react_1.default.createElement(material_1.Box, { textAlign: "left", mb: { xs: 3, md: 6 } },
            react_1.default.createElement(material_1.FormLabel, { sx: { mb: 1.5, display: "block" } }, "Username"),
            react_1.default.createElement(material_1.TextField, { sx: { mb: 3 }, required: true, fullWidth: true, id: "username", placeholder: "Enter", name: "username", autoComplete: "username", autoFocus: true, value: username, onChange: function (_a) {
                    var target = _a.target;
                    return setUsername(target.value);
                } }),
            react_1.default.createElement(material_1.Button, { onClick: function () { return onSubmit(username); }, disabled: username.length === 0, fullWidth: true, variant: "contained" }, "Next"))));
}
exports.default = UpdateUserForm;
//# sourceMappingURL=UpdateUserForm.js.map