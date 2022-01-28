"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
var toolkit_1 = require("@reduxjs/toolkit");
var redux_localstorage_simple_1 = require("redux-localstorage-simple");
var counterSlice_1 = __importDefault(require("./counterSlice"));
var adminAuthSlice_1 = __importDefault(require("./adminAuthSlice"));
var uiSlice_1 = __importDefault(require("./uiSlice"));
exports.store = (0, toolkit_1.configureStore)({
    reducer: {
        counter: counterSlice_1.default,
        auth: adminAuthSlice_1.default,
        ui: uiSlice_1.default,
    },
    preloadedState: (0, redux_localstorage_simple_1.load)(),
    middleware: function (getDefaultMiddleware) { return getDefaultMiddleware().concat((0, redux_localstorage_simple_1.save)()); },
});
//# sourceMappingURL=store.js.map