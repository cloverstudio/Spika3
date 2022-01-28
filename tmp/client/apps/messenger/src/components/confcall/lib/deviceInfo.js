"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bowser_1 = __importDefault(require("bowser"));
// TODO: For testing.
window.BOWSER = bowser_1.default;
function default_1() {
    var ua = navigator.userAgent;
    var browser = bowser_1.default.getParser(ua);
    var flag;
    if (browser.satisfies({ chrome: '>=0', chromium: '>=0' }))
        flag = 'chrome';
    else if (browser.satisfies({ firefox: '>=0' }))
        flag = 'firefox';
    else if (browser.satisfies({ safari: '>=0' }))
        flag = 'safari';
    else if (browser.satisfies({ opera: '>=0' }))
        flag = 'opera';
    else if (browser.satisfies({ 'microsoft edge': '>=0' }))
        flag = 'edge';
    else
        flag = 'unknown';
    return {
        flag: flag,
        name: browser.getBrowserName(),
        version: browser.getBrowserVersion()
    };
}
exports.default = default_1;
//# sourceMappingURL=deviceInfo.js.map