"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAppSelector = exports.useAppDispatch = void 0;
var react_redux_1 = require("react-redux");
// Use throughout your app instead of plain `useDispatch` and `useSelector`
var useAppDispatch = function () { return (0, react_redux_1.useDispatch)(); };
exports.useAppDispatch = useAppDispatch;
exports.useAppSelector = react_redux_1.useSelector;
//# sourceMappingURL=index.js.map