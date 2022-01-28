"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256 = exports.generateRandomString = exports.wait = void 0;
var sha256_1 = __importDefault(require("crypto-js/sha256"));
function wait(sec) {
    return new Promise(function (res) {
        setTimeout(function () {
            res();
        }, sec * 1000);
    });
}
exports.wait = wait;
function generateRandomString(length) {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
exports.generateRandomString = generateRandomString;
function sha256(original) {
    return (0, sha256_1.default)(original).toString();
}
exports.sha256 = sha256;
//# sourceMappingURL=utils.js.map