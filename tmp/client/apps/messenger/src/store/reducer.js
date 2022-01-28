"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var toolkit_1 = require("@reduxjs/toolkit");
var api_1 = __importDefault(require("../api/api"));
var counterSlice_1 = __importDefault(require("./counterSlice"));
var adminAuthSlice_1 = __importDefault(require("./adminAuthSlice"));
var rootReducer = (0, toolkit_1.combineReducers)((_a = {
        counter: counterSlice_1.default,
        auth: adminAuthSlice_1.default
    },
    _a[api_1.default.reducerPath] = api_1.default.reducer,
    _a));
exports.default = rootReducer;
//# sourceMappingURL=reducer.js.map