"use strict";
var debug = require('debug');
var APP_NAME = 'mediasoup-demo-server';
var Logger = /** @class */ (function () {
    function Logger(prefix) {
        if (prefix) {
            this._debug = debug(APP_NAME + ":" + prefix);
            this._info = debug(APP_NAME + ":INFO:" + prefix);
            this._warn = debug(APP_NAME + ":WARN:" + prefix);
            this._error = debug(APP_NAME + ":ERROR:" + prefix);
        }
        else {
            this._debug = debug(APP_NAME);
            this._info = debug(APP_NAME + ":INFO");
            this._warn = debug(APP_NAME + ":WARN");
            this._error = debug(APP_NAME + ":ERROR");
        }
        /* eslint-disable no-console */
        this._debug.log = console.info.bind(console);
        this._info.log = console.info.bind(console);
        this._warn.log = console.warn.bind(console);
        this._error.log = console.error.bind(console);
        /* eslint-enable no-console */
    }
    Object.defineProperty(Logger.prototype, "debug", {
        get: function () {
            return this._debug;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Logger.prototype, "info", {
        get: function () {
            return this._info;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Logger.prototype, "warn", {
        get: function () {
            return this._warn;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Logger.prototype, "error", {
        get: function () {
            return this._error;
        },
        enumerable: false,
        configurable: true
    });
    return Logger;
}());
module.exports = Logger;
//# sourceMappingURL=Logger.js.map