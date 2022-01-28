"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var googleapis_1 = require("googleapis");
var logger_1 = require("../../../components/logger");
var PATH = "/v1/projects/" + process.env.FCM_PROJECT_ID + "/messages:send";
var MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
var SCOPES = [MESSAGING_SCOPE];
function getAccessToken() {
    return new Promise(function (resolve, reject) {
        var jwtClient = new googleapis_1.google.auth.JWT(process.env.FCM_EMAIL, null, process.env.FCM_PRIVATE_KEY, SCOPES, null);
        jwtClient.authorize(function (err, tokens) {
            if (err) {
                reject(err);
                return;
            }
            resolve(tokens.access_token);
        });
    });
}
function sendFcmMessage(fcmMessage) {
    return __awaiter(this, void 0, void 0, function () {
        var accessToken, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (process.env.IS_TEST === "1") {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, getAccessToken()];
                case 1:
                    accessToken = _a.sent();
                    return [4 /*yield*/, (0, axios_1.default)({
                            method: "post",
                            url: "https://" + process.env.FCM_HOST + PATH,
                            data: fcmMessage,
                            headers: {
                                Authorization: "Bearer " + accessToken,
                            },
                            validateStatus: function (status) { return status < 500; },
                        })];
                case 2:
                    response = _a.sent();
                    if (response.status !== 200) {
                        (0, logger_1.error)("FCM error, ", { status: response.status, data: response.data });
                        throw new Error("FCM error");
                    }
                    return [2 /*return*/, response.data];
            }
        });
    });
}
exports.default = sendFcmMessage;
//# sourceMappingURL=sendFcmMessage.js.map