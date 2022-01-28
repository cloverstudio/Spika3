"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
var toolkit_1 = require("@reduxjs/toolkit");
var redux_localstorage_simple_1 = require("redux-localstorage-simple");
var api_1 = __importDefault(require("../api/api"));
var reducer_1 = __importDefault(require("./reducer"));
console.log({ ENV: ENV });
exports.store = (0, toolkit_1.configureStore)({
    reducer: reducer_1.default,
    preloadedState: (0, redux_localstorage_simple_1.load)(),
    middleware: function (getDefaultMiddleware) {
        return getDefaultMiddleware({
            serializableCheck: { ignoredPaths: ["store.api"] },
        })
            .concat(api_1.default.middleware)
            .concat((0, redux_localstorage_simple_1.save)());
    },
});
if (ENV !== "production" && (module === null || module === void 0 ? void 0 : module.hot)) {
    module.hot.accept("./reducer", function () { return exports.store.replaceReducer(reducer_1.default); });
}
//# sourceMappingURL=store.js.map