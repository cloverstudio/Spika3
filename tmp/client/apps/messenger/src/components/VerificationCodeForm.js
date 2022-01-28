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
var PinInput_1 = __importDefault(require("./PinInput"));
var CountdownTimer_1 = __importDefault(require("./CountdownTimer"));
function VerificationCodeForm(_a) {
    var onSubmit = _a.onSubmit, onResend = _a.onResend, telephoneNumber = _a.telephoneNumber, error = _a.error, timeLeft = _a.timeLeft;
    var refs = [
        (0, react_1.useRef)(null),
        (0, react_1.useRef)(null),
        (0, react_1.useRef)(null),
        (0, react_1.useRef)(null),
        (0, react_1.useRef)(null),
        (0, react_1.useRef)(null),
    ];
    var _b = (0, react_1.useState)(Array(6)
        .fill(true)
        .map(function (_, i) { return ({ ref: refs[i], value: "" }); })), codeArr = _b[0], setCodeArr = _b[1];
    var tryToSubmit = function () {
        if (!timeLeft) {
            return;
        }
        var emptyIndex = codeArr.findIndex(function (c) { return !c.value; });
        if (emptyIndex > -1) {
            return codeArr[emptyIndex].ref.current.focus();
        }
        var verificationCode = codeArr.map(function (c) { return c.value; }).join("");
        onSubmit(verificationCode);
    };
    (0, react_1.useEffect)(function () {
        if (codeArr.every(function (o) { return !!o.value; })) {
            tryToSubmit();
        }
    }, [codeArr]);
    var codeFilled = codeArr.every(function (o) { return !!o.value; });
    var someCodeEntered = codeArr.some(function (o) { return !!o.value; });
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(material_1.Typography, { display: { xs: "none", md: "block" }, mb: 3, component: "h1", variant: "h3", fontWeight: "bold" }, "Welcome!"),
        react_1.default.createElement(material_1.Typography, { component: "p", variant: "body1", mx: { xs: "auto", md: 0 }, maxWidth: { xs: "220px", md: "none" }, mb: { xs: error ? 1 : 5, md: error ? 4 : 10 }, fontWeight: "medium" },
            "We sent you verification code on ",
            telephoneNumber,
            "!"),
        error && !someCodeEntered && (react_1.default.createElement(material_1.Alert, { sx: { mb: 4 }, severity: "error" },
            react_1.default.createElement(material_1.AlertTitle, { sx: { mb: 0 } }, error.message))),
        react_1.default.createElement(material_1.Box, { textAlign: "left", mb: { xs: 3, md: 6 } },
            react_1.default.createElement(material_1.Box, { mb: 2 },
                react_1.default.createElement(material_1.Box, { display: "flex", justifyContent: "space-between", mb: 2 },
                    react_1.default.createElement(CountdownTimer_1.default, { timeLeft: timeLeft }),
                    react_1.default.createElement(material_1.Link, { fontWeight: "bold", underline: "hover", sx: { cursor: "pointer" }, onClick: onResend, variant: "body1" }, "Resend code")),
                react_1.default.createElement(PinInput_1.default, { setCodeArr: setCodeArr, codeArr: codeArr })),
            react_1.default.createElement(material_1.Button, { onClick: tryToSubmit, disabled: !codeFilled || !timeLeft, fullWidth: true, variant: "contained" }, "Next"))));
}
exports.default = VerificationCodeForm;
//# sourceMappingURL=VerificationCodeForm.js.map