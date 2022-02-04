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
var react_1 = __importStar(require("react"));
var react_router_dom_1 = require("react-router-dom");
var auth_1 = require("../api/auth");
var AuthLayout_1 = __importDefault(require("../components/AuthLayout"));
var VerificationCodeForm_1 = __importDefault(require("../components/VerificationCodeForm"));
var TelephoneNumberForm_1 = __importDefault(require("../components/TelephoneNumberForm"));
var UpdateUserForm_1 = __importDefault(require("../components/UpdateUserForm"));
var useDeviceId_1 = __importDefault(require("../hooks/useDeviceId"));
var utils_1 = require("../../../../lib/utils");
var useCountdownTimer_1 = __importDefault(require("../hooks/useCountdownTimer"));
function SignUpPage() {
    var _this = this;
    var _a;
    var history = (0, react_router_dom_1.useHistory)();
    var deviceId = (0, useDeviceId_1.default)();
    var _b = (0, react_1.useState)(0), step = _b[0], setStep = _b[1];
    var _c = (0, auth_1.useSignUpMutation)(), signUp = _c[0], signUpMutation = _c[1];
    var _d = (0, auth_1.useVerifyMutation)(), verify = _d[0], verifyMutation = _d[1];
    var _e = (0, auth_1.useUpdateMutation)(), update = _e[0], updateMutation = _e[1];
    var timer = (0, useCountdownTimer_1.default)(60);
    var handleSignUp = function (telephoneNumber) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    timer.start();
                    return [4 /*yield*/, signUp({
                            telephoneNumber: telephoneNumber,
                            telephoneNumberHashed: (0, utils_1.sha256)(telephoneNumber),
                            deviceId: deviceId,
                        })];
                case 1:
                    _a.sent();
                    setStep(1);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("Sign up error", error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleVerify = function (code) { return __awaiter(_this, void 0, void 0, function () {
        var res, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, verify({ code: code, deviceId: deviceId }).unwrap()];
                case 1:
                    res = _b.sent();
                    if ((_a = res.device) === null || _a === void 0 ? void 0 : _a.token) {
                        window.localStorage.setItem("access-token", res.device.token);
                        if (signUpMutation.data.isNewUser) {
                            setStep(2);
                        }
                        else {
                            history.push("/");
                        }
                    }
                    else {
                        console.error("Token not returned");
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _b.sent();
                    console.log({ error: error_2 });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleSetUsername = function (username) { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, update({ displayName: username }).unwrap()];
                case 1:
                    _a.sent();
                    history.push("/");
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error("Update failed ", error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (react_1.default.createElement(AuthLayout_1.default, { loading: signUpMutation.isLoading || verifyMutation.isLoading },
        step === 0 && react_1.default.createElement(TelephoneNumberForm_1.default, { onSubmit: handleSignUp }),
        step === 1 && (react_1.default.createElement(VerificationCodeForm_1.default, { onSubmit: handleVerify, onResend: function () { var _a; return handleSignUp((_a = signUpMutation.data) === null || _a === void 0 ? void 0 : _a.user.telephoneNumber); }, telephoneNumber: (_a = signUpMutation.data) === null || _a === void 0 ? void 0 : _a.user.telephoneNumber, error: verifyMutation.error, timeLeft: timer.left })),
        step === 2 && (react_1.default.createElement(UpdateUserForm_1.default, { onSubmit: handleSetUsername, error: updateMutation.error }))));
}
exports.default = SignUpPage;
//# sourceMappingURL=auth.js.map