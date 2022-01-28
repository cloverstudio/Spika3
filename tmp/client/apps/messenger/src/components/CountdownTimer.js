"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var material_1 = require("@mui/material");
function CountdownTimer(_a) {
    var timeLeft = _a.timeLeft;
    var m = timeLeft ? "0" + Math.floor(timeLeft / 60) : "00";
    var s = timeLeft && timeLeft % 60 > 0
        ? timeLeft % 60 < 10
            ? "0" + timeLeft % 60
            : timeLeft % 60
        : "00";
    return (react_1.default.createElement(material_1.Typography, { component: "span", variant: "body1", fontWeight: "medium" }, m + ":" + s));
}
exports.default = CountdownTimer;
//# sourceMappingURL=CountdownTimer.js.map