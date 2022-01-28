"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
exports.default = (function (_a) {
    var title = _a.title, children = _a.children, onClose = _a.onClose, onOK = _a.onOK;
    return react_1.default.createElement("div", { className: "modal" },
        react_1.default.createElement("div", { className: "setting-window" },
            react_1.default.createElement("i", { className: "fas fa-times", onClick: function (e) { return onClose(); } }),
            react_1.default.createElement("span", null, title),
            children,
            react_1.default.createElement("button", { onClick: function (e) { return onOK(); } }, "OK")));
});
//# sourceMappingURL=Modal.js.map