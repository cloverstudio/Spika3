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
var dayjs_1 = __importDefault(require("dayjs"));
var utils_1 = __importDefault(require("../../../components/utils"));
var Consts = __importStar(require("../../../components/consts"));
var TokenHandler = /** @class */ (function () {
    function TokenHandler() {
        this.tokens = [];
    }
    TokenHandler.prototype.newToken = function () {
        var newToken = utils_1.default.randomString(16);
        var newTokenObj = {
            token: newToken,
            expireDate: (0, dayjs_1.default)().unix() + Consts.ADMIN_TOKEN_EXPIRED,
        };
        this.tokens.push(newTokenObj);
        return newTokenObj;
    };
    TokenHandler.prototype.checkToken = function (token) {
        var matchedToken = this.tokens.find(function (item) { return item.token === token; });
        if (matchedToken === undefined)
            return false;
        return matchedToken.expireDate > (0, dayjs_1.default)().unix();
    };
    return TokenHandler;
}());
exports.default = new TokenHandler();
//# sourceMappingURL=adminTokens.js.map