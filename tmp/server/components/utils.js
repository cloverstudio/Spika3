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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = __importDefault(require("crypto"));
var dayjs_1 = __importDefault(require("dayjs"));
var Consts = __importStar(require("./consts"));
var utils = /** @class */ (function () {
    function utils() {
    }
    var _a;
    _a = utils;
    utils.isEmpty = function (val) {
        return val === undefined || val === null || val == "";
    };
    utils.isEmptyNumber = function (val) {
        return val === undefined || val === null || val === NaN;
    };
    utils.randomString = function (length) {
        var result = "";
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };
    utils.randomNumber = function (length) {
        var result = "";
        var characters = "0123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };
    utils.wait = function (duration) {
        return new Promise(function (res) {
            setTimeout(function () {
                res(null);
            }, duration * 1000);
        });
    };
    utils.waitToUpdate = function (obj, paramName) {
        var initialObj = obj[paramName];
        return new Promise(function (res) {
            var timer = setInterval(function () {
                console.log(initialObj, obj[paramName]);
                if (initialObj !== obj[paramName]) {
                    clearTimeout(timer);
                    res(null);
                }
            }, 1000);
        });
    };
    utils.isMobile = function () {
        if (typeof window !== "undefined") {
            return window.innerWidth < 768;
        }
        return false;
    };
    utils.isBrowser = function () {
        return typeof window !== "undefined";
    };
    utils.truncateString = function (str, limit) {
        if (limit === void 0) { limit = 16; }
        var suffix = "";
        if (str.length > limit)
            suffix = "...";
        return str.substr(0, limit) + suffix;
    };
    utils.sha256 = function (original) {
        var shasum = crypto_1.default.createHash("sha256");
        shasum.update(original);
        var hash = shasum.digest("hex");
        return hash;
    };
    utils.checkLoginName = function (loginName) {
        return /^[a-zA-Z0-9_-]{6,}$/.test(loginName);
    };
    utils.checkPassword = function (password) {
        return /^[a-zA-Z0-9_-]{6,}$/.test(password);
    };
    utils.createToken = function () {
        return _a.randomString(16);
    };
    utils.getTokenExpireDate = function () {
        return (0, dayjs_1.default)().add(Consts.TOKEN_VALID_DAY).toDate();
    };
    utils.generateRoomName = function () {
        return _a.randomString(16);
    };
    return utils;
}());
exports.default = utils;
//# sourceMappingURL=utils.js.map