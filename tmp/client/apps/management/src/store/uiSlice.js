"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.showBasicDialog = exports.hideBasicDialog = exports.hideSnackBar = exports.showSnackBar = exports.uiSlice = void 0;
var toolkit_1 = require("@reduxjs/toolkit");
exports.uiSlice = (0, toolkit_1.createSlice)({
    name: "ui",
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: {
        showSnackBar: false,
        snackBarInfo: null,
        basicDialogInfo: null,
        showBasicDialog: false,
    },
    reducers: {
        showSnackBar: function (state, action) {
            state.showSnackBar = true;
            state.snackBarInfo = action.payload;
        },
        hideSnackBar: function (state, action) {
            state.showSnackBar = false;
        },
        showBasicDialog: function (state, action) {
            state.showBasicDialog = true;
            state.basicDialogInfo = action.payload;
        },
        hideBasicDialog: function (state, action) {
            state.showBasicDialog = false;
        },
    },
});
exports.showSnackBar = (_a = exports.uiSlice.actions, _a.showSnackBar), exports.hideSnackBar = _a.hideSnackBar, exports.hideBasicDialog = _a.hideBasicDialog, exports.showBasicDialog = _a.showBasicDialog;
exports.default = exports.uiSlice.reducer;
//# sourceMappingURL=uiSlice.js.map