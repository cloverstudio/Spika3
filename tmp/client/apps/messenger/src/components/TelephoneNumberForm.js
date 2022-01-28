"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var material_1 = require("@mui/material");
var CountryPicker_1 = __importDefault(require("./CountryPicker"));
function TelephoneNumberForm(_a) {
    var onSubmit = _a.onSubmit;
    var _b = react_1.default.useState("1"), countryCode = _b[0], setCountryCode = _b[1];
    var _c = react_1.default.useState(""), phoneNumber = _c[0], setPhoneNumber = _c[1];
    var _d = react_1.default.useState(false), validPhoneNumber = _d[0], setValidPhoneNumber = _d[1];
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(material_1.Typography, { display: { xs: "none", md: "block" }, mb: 3, component: "h1", variant: "h3", fontWeight: "bold" }, "Welcome!"),
        react_1.default.createElement(material_1.Typography, { component: "p", variant: "body1", mx: { xs: "auto", md: 0 }, maxWidth: { xs: "220px", md: "none" }, mb: { xs: 5, md: 10 }, fontWeight: "medium" }, "Enter your phone number to start using Spika"),
        react_1.default.createElement(material_1.Box, { textAlign: "left", mb: { xs: 3, md: 6 } },
            react_1.default.createElement(material_1.FormLabel, { sx: { mb: 1.5, display: "block" } }, "Phone number"),
            react_1.default.createElement(CountryPicker_1.default, { code: setCountryCode, phoneNum: setPhoneNumber, validation: setValidPhoneNumber }),
            react_1.default.createElement(material_1.Button, { onClick: function () { return onSubmit("+" + countryCode + phoneNumber); }, disabled: !validPhoneNumber, fullWidth: true, variant: "contained", sx: { marginTop: "1em" } }, "Next"))));
}
exports.default = TelephoneNumberForm;
//# sourceMappingURL=TelephoneNumberForm.js.map