"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var material_1 = require("@mui/material");
function PinInput(_a) {
    var codeArr = _a.codeArr, setCodeArr = _a.setCodeArr;
    return (react_1.default.createElement(material_1.Box, { display: "grid", gap: 1, gridTemplateColumns: "repeat(6, 1fr)", justifyContent: "space-between" }, codeArr.map(function (c, i) {
        return (react_1.default.createElement(NumberInput, { key: i, value: c.value, inputRef: c.ref, handleChange: function (value) {
                var isDelete = !value;
                var previousValue = c.value;
                var newArr = __spreadArray([], codeArr, true);
                if (value && isNaN(+value)) {
                    return;
                }
                if (!previousValue && isDelete && i > 0) {
                    newArr.splice(i - 1, 1, __assign(__assign({}, codeArr[i - 1]), { value: value }));
                    setCodeArr(newArr);
                    newArr[i - 1].ref.current.focus();
                    return;
                }
                if (!isDelete && value.length > 1) {
                    return;
                }
                newArr.splice(i, 1, __assign(__assign({}, codeArr[i]), { value: value }));
                setCodeArr(newArr);
                if (i < 5 && !isDelete) {
                    newArr[i + 1].ref.current.focus();
                }
            } }));
    })));
}
exports.default = PinInput;
function NumberInput(_a) {
    var value = _a.value, handleChange = _a.handleChange, inputRef = _a.inputRef;
    var handleKeyDown = function (event) {
        if (event.key === "Backspace") {
            handleChange("");
        }
    };
    return (react_1.default.createElement(material_1.Box, null,
        react_1.default.createElement(material_1.InputBase, { inputProps: {
                ref: inputRef,
                pattern: "[1-9]",
            }, value: value, onChange: function (_a) {
                var target = _a.target;
                handleChange(target.value);
            }, onKeyDown: handleKeyDown, sx: {
                input: {
                    border: "1px solid #9AA0A6",
                    borderRadius: "10px",
                    height: "100%",
                    padding: "5px",
                    textAlign: "center",
                    color: "#141414",
                    fontWeight: "bold",
                    fontSize: "28px",
                    lineHeight: "34px",
                    "&::-webkit-outer-spin-button": {
                        margin: "0",
                        WebkitAppearance: "none",
                    },
                    "&::-webkit-inner-spin-button": {
                        margin: "0",
                        WebkitAppearance: "none",
                    },
                    "&[type=number]": {
                        margin: "0",
                        WebkitAppearance: "textfield",
                    },
                },
            } })));
}
//# sourceMappingURL=PinInput.js.map