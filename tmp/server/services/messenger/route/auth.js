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
var express_1 = require("express");
var client_1 = require("@prisma/client");
var utils_1 = __importDefault(require("../../../components/utils"));
var Constants = __importStar(require("../../../components/consts"));
var logger_1 = __importStar(require("../../../components/logger"));
var string_1 = require("../../../components/string");
var validateMiddleware_1 = __importDefault(require("../../../components/validateMiddleware"));
var yup = __importStar(require("yup"));
var response_1 = require("../../../components/response");
var sanitize_1 = __importDefault(require("../../../components/sanitize"));
var prisma = new client_1.PrismaClient();
var authSchema = yup.object().shape({
    body: yup.object().shape({
        telephoneNumber: yup.string().required(),
        telephoneNumberHashed: yup.string().required(),
        deviceId: yup.string().required(),
    }),
});
var verifySchema = yup.object().shape({
    body: yup.object().shape({
        code: yup.string().required(),
        deviceId: yup.string().required(),
    }),
});
exports.default = (function (_a) {
    var rabbitMQChannel = _a.rabbitMQChannel;
    var router = (0, express_1.Router)();
    router.get("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                res.status(405).send((0, response_1.errorResponse)("Method not allowed"));
            }
            catch (e) {
                (0, logger_1.error)(e);
                res.status(500).send((0, response_1.errorResponse)("Server error " + e));
            }
            return [2 /*return*/];
        });
    }); });
    router.post("/", (0, validateMiddleware_1.default)(authSchema), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var telephoneNumber, telephoneNumberHashed, deviceId, osName, isNewUser, verificationCode, requestUser, newUser, requestDevice, SMSPayload, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 11, , 12]);
                    telephoneNumber = req.body.telephoneNumber;
                    telephoneNumberHashed = req.body.telephoneNumberHashed;
                    deviceId = req.body.deviceId;
                    osName = (req.headers["os-name"] || "");
                    isNewUser = false;
                    verificationCode = process.env.IS_TEST === "1"
                        ? Constants.BACKDOOR_VERIFICATION_CODE
                        : utils_1.default.randomNumber(6);
                    return [4 /*yield*/, prisma.user.findFirst({
                            where: { telephoneNumber: telephoneNumber },
                        })];
                case 1:
                    requestUser = _a.sent();
                    if (!!requestUser) return [3 /*break*/, 3];
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                telephoneNumber: telephoneNumber,
                                telephoneNumberHashed: telephoneNumberHashed,
                                verificationCode: verificationCode,
                            },
                        })];
                case 2:
                    newUser = _a.sent();
                    requestUser = newUser;
                    isNewUser = true;
                    return [3 /*break*/, 5];
                case 3:
                    isNewUser = !requestUser.displayName;
                    return [4 /*yield*/, prisma.user.update({
                            where: {
                                id: requestUser.id,
                            },
                            data: {
                                verificationCode: verificationCode,
                                verified: false,
                            },
                        })];
                case 4:
                    requestUser = _a.sent();
                    _a.label = 5;
                case 5:
                    (0, logger_1.default)("Verification code " + verificationCode + ", device id " + deviceId);
                    return [4 /*yield*/, prisma.device.findFirst({
                            where: { deviceId: deviceId },
                        })];
                case 6:
                    requestDevice = _a.sent();
                    if (!!requestDevice) return [3 /*break*/, 8];
                    return [4 /*yield*/, prisma.device.create({
                            data: {
                                deviceId: deviceId,
                                userId: requestUser.id,
                            },
                        })];
                case 7:
                    requestDevice = _a.sent();
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, prisma.device.update({
                        where: {
                            id: requestDevice.id,
                        },
                        data: {
                            tokenExpiredAt: new Date(),
                        },
                    })];
                case 9:
                    // expire token if existing device
                    requestDevice = _a.sent();
                    _a.label = 10;
                case 10:
                    SMSPayload = {
                        telephoneNumber: telephoneNumber,
                        content: (0, string_1.verificationCodeSMS)({ verificationCode: verificationCode, osName: osName }),
                    };
                    rabbitMQChannel.sendToQueue(Constants.QUEUE_SMS, Buffer.from(JSON.stringify(SMSPayload)));
                    res.send((0, response_1.successResponse)({
                        isNewUser: isNewUser,
                        user: (0, sanitize_1.default)(requestUser).user(),
                        device: {
                            id: requestDevice.id,
                        },
                    }));
                    return [3 /*break*/, 12];
                case 11:
                    e_1 = _a.sent();
                    (0, logger_1.error)(e_1);
                    res.status(500).send((0, response_1.errorResponse)("Server error " + e_1));
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    }); });
    router.post("/verify", (0, validateMiddleware_1.default)(verifySchema), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var verificationCode, deviceId, requestUser, requestDevice, newToken, expireDate, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    verificationCode = req.body.code;
                    deviceId = req.body.deviceId;
                    return [4 /*yield*/, prisma.user.findFirst({
                            where: { verificationCode: verificationCode },
                            orderBy: {
                                createdAt: "desc",
                            },
                        })];
                case 1:
                    requestUser = _a.sent();
                    if (!requestUser) {
                        return [2 /*return*/, res.status(403).send((0, response_1.errorResponse)("Verification code is invalid"))];
                    }
                    return [4 /*yield*/, prisma.device.findFirst({
                            where: {
                                deviceId: deviceId,
                                userId: requestUser.id,
                            },
                        })];
                case 2:
                    requestDevice = _a.sent();
                    if (!requestDevice) {
                        return [2 /*return*/, res.status(403).send((0, response_1.errorResponse)("Invalid device id"))];
                    }
                    return [4 /*yield*/, prisma.user.update({
                            where: {
                                id: requestUser.id,
                            },
                            data: {
                                verificationCode: "",
                                verified: true,
                            },
                        })];
                case 3:
                    _a.sent();
                    newToken = utils_1.default.createToken();
                    expireDate = utils_1.default.getTokenExpireDate();
                    return [4 /*yield*/, prisma.device.update({
                            where: {
                                id: requestDevice.id,
                            },
                            data: {
                                token: newToken,
                                tokenExpiredAt: expireDate,
                            },
                        })];
                case 4:
                    requestDevice = _a.sent();
                    res.send((0, response_1.successResponse)({
                        user: (0, sanitize_1.default)(requestUser).user(),
                        device: requestDevice,
                    }));
                    return [3 /*break*/, 6];
                case 5:
                    e_2 = _a.sent();
                    (0, logger_1.error)(e_2);
                    res.status(500).send((0, response_1.errorResponse)("Server error " + e_2));
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); });
    return router;
});
//# sourceMappingURL=auth.js.map