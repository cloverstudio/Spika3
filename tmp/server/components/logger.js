"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warn = exports.error = void 0;
function default_1() {
    var aynthing = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        aynthing[_i] = arguments[_i];
    }
    if (process.env.LOG_INFO !== "0") {
        console.log.apply(console, aynthing);
    }
}
exports.default = default_1;
function error() {
    var aynthing = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        aynthing[_i] = arguments[_i];
    }
    if (process.env.LOG_ERROR !== "0") {
        console.error.apply(console, aynthing);
    }
}
exports.error = error;
function warn() {
    var aynthing = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        aynthing[_i] = arguments[_i];
    }
    if (process.env.LOG_WARN !== "0") {
        console.warn.apply(console, aynthing);
    }
}
exports.warn = warn;
//# sourceMappingURL=logger.js.map