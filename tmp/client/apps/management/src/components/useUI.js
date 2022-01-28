"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useShowBasicDialog = exports.useShowSnackBar = exports.uiListeners = void 0;
var react_redux_1 = require("react-redux");
var uiSlice_1 = require("../store/uiSlice");
// global
exports.uiListeners = {
    onBasicDialogOK: undefined,
};
function useShowSnackBar() {
    var dispatch = (0, react_redux_1.useDispatch)();
    return function (param) {
        dispatch((0, uiSlice_1.showSnackBar)({
            severity: param.severity,
            text: param.text,
        }));
    };
}
exports.useShowSnackBar = useShowSnackBar;
function useShowBasicDialog() {
    var dispatch = (0, react_redux_1.useDispatch)();
    return function (param, callBack) {
        exports.uiListeners.onBasicDialogOK = callBack;
        dispatch((0, uiSlice_1.showBasicDialog)({
            text: param.text,
            allowButtonLabel: "OK",
            denyButtonLabel: "Cancel",
            title: "Warning",
        }));
    };
}
exports.useShowBasicDialog = useShowBasicDialog;
//# sourceMappingURL=useUI.js.map