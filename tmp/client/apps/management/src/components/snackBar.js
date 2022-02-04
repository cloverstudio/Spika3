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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var material_1 = require("@mui/material");
var react_redux_1 = require("react-redux");
var uiSlice_1 = require("../store/uiSlice");
function SnackBar() {
    var _a, _b;
    var ui = (0, react_redux_1.useSelector)(function (state) { return state.ui; });
    var dispatch = (0, react_redux_1.useDispatch)();
    (0, react_1.useEffect)(function () {
        if (ui.showSnackBar) {
            setTimeout(function () {
                dispatch((0, uiSlice_1.hideSnackBar)());
            }, 6000);
        }
    }, [ui.snackBarInfo]);
    return (react_1.default.createElement(material_1.Snackbar, { open: ui.showSnackBar, autoHideDuration: 6000 },
        react_1.default.createElement(material_1.Alert, { severity: (_a = ui.snackBarInfo) === null || _a === void 0 ? void 0 : _a.severity, sx: { width: "100%" } }, (_b = ui.snackBarInfo) === null || _b === void 0 ? void 0 : _b.text)));
}
exports.default = SnackBar;
//# sourceMappingURL=snackBar.js.map