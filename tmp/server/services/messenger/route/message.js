"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var logger_1 = require("../../../components/logger");
var auth_1 = __importDefault(require("../lib/auth"));
var yup = __importStar(require("yup"));
var validateMiddleware_1 = __importDefault(require("../../../components/validateMiddleware"));
var response_1 = require("../../../components/response");
var consts_1 = require("../../../components/consts");
var Constants = __importStar(require("../../../components/consts"));
var prisma = new client_1.PrismaClient();
var postMessageSchema = yup.object().shape({
    body: yup.object().shape({
        roomId: yup.number().strict().min(1).required(),
        type: yup.string().strict().required(),
        message: yup.object().required(),
    }),
});
exports.default = (function (_a) {
    var rabbitMQChannel = _a.rabbitMQChannel;
    var router = (0, express_1.Router)();
    router.post("/", auth_1.default, (0, validateMiddleware_1.default)(postMessageSchema), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, roomId, type, messageBody_1, fromUserId_1, fromDeviceId_1, room, devices_1, deviceMessages, message_1, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userReq = req;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    roomId = parseInt(req.body.roomId || "0");
                    type = req.body.type;
                    messageBody_1 = req.body.message;
                    fromUserId_1 = userReq.user.id;
                    fromDeviceId_1 = userReq.device.id;
                    return [4 /*yield*/, prisma.room.findUnique({
                            where: { id: roomId },
                            include: { users: true },
                        })];
                case 2:
                    room = _a.sent();
                    if (!room) {
                        return [2 /*return*/, res.status(400).send((0, response_1.errorResponse)("Room not found", userReq.lang))];
                    }
                    return [4 /*yield*/, prisma.device.findMany({
                            where: {
                                userId: { in: room.users.map(function (u) { return u.userId; }) },
                            },
                        })];
                case 3:
                    devices_1 = _a.sent();
                    deviceMessages = devices_1.map(function (device) { return ({
                        deviceId: device.id,
                        userId: device.userId,
                        fromUserId: fromUserId_1,
                        fromDeviceId: fromDeviceId_1,
                        messageBody: messageBody_1,
                        action: consts_1.MESSAGE_ACTION_NEW_MESSAGE,
                    }); });
                    return [4 /*yield*/, prisma.message.create({
                            data: {
                                type: type,
                                roomId: roomId,
                                fromUserId: userReq.user.id,
                                fromDeviceId: userReq.device.id,
                                totalDeviceCount: deviceMessages.length,
                            },
                        })];
                case 4:
                    message_1 = _a.sent();
                    res.send((0, response_1.successResponse)({ message: message_1 }, userReq.lang));
                    _a.label = 5;
                case 5:
                    if (!deviceMessages.length) return [3 /*break*/, 7];
                    return [4 /*yield*/, Promise.all(deviceMessages.splice(0, 10).map(function (deviceMessage) { return __awaiter(void 0, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, prisma.deviceMessage.create({
                                            data: __assign(__assign({}, deviceMessage), { messageId: message_1.id }),
                                        })];
                                    case 1:
                                        _b.sent();
                                        rabbitMQChannel.sendToQueue(Constants.QUEUE_PUSH, Buffer.from(JSON.stringify({
                                            type: Constants.PUSH_TYPE_NEW_MESSAGE,
                                            token: (_a = devices_1.find(function (d) { return d.id == deviceMessage.deviceId; })) === null || _a === void 0 ? void 0 : _a.pushToken,
                                            data: {
                                                deviceMessage: deviceMessage,
                                            },
                                        })));
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 7: return [3 /*break*/, 9];
                case 8:
                    e_1 = _a.sent();
                    (0, logger_1.error)(e_1);
                    res.status(500).send((0, response_1.errorResponse)("Server error " + e_1, userReq.lang));
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    }); });
    return router;
});
//# sourceMappingURL=message.js.map