"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var Logger = /** @class */ (function () {
    function Logger(prefix, output) {
        if (output === void 0) { output = false; }
        this._output = false;
        this._prefix = prefix;
        this._output = output;
        this._listeners = [];
    }
    Logger.prototype.debug = function (obj) {
        if (!this._output)
            return;
        var output = this._prefix + " debug: " + obj;
        console.log(output);
        this._listeners.map(function (func) { return func("debug", "" + obj); });
    };
    Logger.prototype.warn = function (obj) {
        var output = this._prefix + " warn: " + obj;
        console.warn(output);
        this._listeners.map(function (func) { return func("warn", "" + obj); });
    };
    Logger.prototype.error = function (obj) {
        var output = this._prefix + " error: " + obj;
        console.error(output);
        this._listeners.map(function (func) { return func("error", "" + obj); });
    };
    Logger.prototype.addListener = function (listener) {
        this._listeners.push(listener);
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map