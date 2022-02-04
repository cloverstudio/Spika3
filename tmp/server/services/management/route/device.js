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
var prisma = new client_1.PrismaClient();
var adminAuth_1 = __importDefault(require("../lib/adminAuth"));
var utils_1 = __importDefault(require("../../../components/utils"));
var consts = __importStar(require("../../../components/consts"));
var logger_1 = require("../../../components/logger");
var response_1 = require("../../../components/response");
exports.default = (function (params) {
    var router = (0, express_1.Router)();
    router.post("/", adminAuth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, userId, deviceId, type, osName, appVersion, token, pushToken, device, newDevice, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userReq = req;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    userId = parseInt(req.body.userId);
                    deviceId = req.body.deviceId;
                    type = req.body.type;
                    osName = req.body.osName;
                    appVersion = req.body.appVersion ? parseInt(req.body.appVersion) : null;
                    token = req.body.token;
                    pushToken = req.body.pushToken;
                    if (utils_1.default.isEmptyNumber(userId))
                        return [2 /*return*/, res.status(400).send((0, response_1.errorResponse)("User id is required", userReq.lang))];
                    if (!deviceId)
                        return [2 /*return*/, res.status(400).send((0, response_1.errorResponse)("Device id is required", userReq.lang))];
                    return [4 /*yield*/, prisma.device.findFirst({
                            where: {
                                deviceId: deviceId,
                            },
                        })];
                case 2:
                    device = _a.sent();
                    if (device != null)
                        return [2 /*return*/, res
                                .status(400)
                                .send((0, response_1.errorResponse)("Device id already exists", userReq.lang))];
                    return [4 /*yield*/, prisma.device.create({
                            data: {
                                userId: userId,
                                deviceId: deviceId,
                                type: type,
                                osName: osName,
                                appVersion: appVersion,
                                token: token,
                                pushToken: pushToken,
                            },
                        })];
                case 3:
                    newDevice = _a.sent();
                    return [2 /*return*/, res.send((0, response_1.successResponse)({ device: newDevice }, userReq.lang))];
                case 4:
                    e_1 = _a.sent();
                    (0, logger_1.error)(e_1);
                    res.status(500).json((0, response_1.errorResponse)("Server error " + e_1, userReq.lang));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    /**
     * TODO: impliment order
     */
    router.get("/", adminAuth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, page, userId, clause, devices, count, _a, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    userReq = req;
                    page = parseInt(req.query.page ? req.query.page : "") || 0;
                    userId = parseInt(req.query.userId ? req.query.userId : "") || 0;
                    clause = userId == 0 ? {} : { userId: userId };
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, prisma.device.findMany({
                            where: clause,
                            orderBy: [
                                {
                                    createdAt: "asc",
                                },
                            ],
                            skip: consts.PAGING_LIMIT * page,
                            take: consts.PAGING_LIMIT,
                        })];
                case 2:
                    devices = _b.sent();
                    if (!(userId == 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.device.count()];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = devices.length;
                    _b.label = 5;
                case 5:
                    count = _a;
                    res.send((0, response_1.successResponse)({
                        list: devices,
                        count: count,
                        limit: consts.PAGING_LIMIT,
                    }, userReq.lang));
                    return [3 /*break*/, 7];
                case 6:
                    e_2 = _b.sent();
                    (0, logger_1.error)(e_2);
                    res.status(500).json((0, response_1.errorResponse)("Server error " + e_2, userReq.lang));
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); });
    router.get("/:deviceId", adminAuth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, deviceId, device, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userReq = req;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    deviceId = parseInt(req.params.deviceId);
                    return [4 /*yield*/, prisma.device.findFirst({
                            where: {
                                id: deviceId,
                            },
                        })];
                case 2:
                    device = _a.sent();
                    if (!device)
                        return [2 /*return*/, res.status(404).send((0, response_1.errorResponse)("Wrong device id", userReq.lang))];
                    return [2 /*return*/, res.send((0, response_1.successResponse)({ device: device }, userReq.lang))];
                case 3:
                    e_3 = _a.sent();
                    (0, logger_1.error)(e_3);
                    res.status(500).json((0, response_1.errorResponse)("Server error " + e_3, userReq.lang));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    router.put("/:deviceId", adminAuth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, idOfDevice, userId, deviceId, type, osName, appVersion, token, pushToken, device, deviceCheckUnique, updateValues, updateDevice, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userReq = req;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    idOfDevice = parseInt(req.params.deviceId);
                    userId = parseInt(req.body.userId);
                    deviceId = req.body.deviceId;
                    type = req.body.type;
                    osName = req.body.osName;
                    appVersion = parseInt(req.body.appVersion);
                    token = req.body.token;
                    pushToken = req.body.pushToken;
                    return [4 /*yield*/, prisma.device.findFirst({
                            where: {
                                id: idOfDevice,
                            },
                        })];
                case 2:
                    device = _a.sent();
                    return [4 /*yield*/, prisma.device.findFirst({
                            where: {
                                deviceId: deviceId,
                            },
                        })];
                case 3:
                    deviceCheckUnique = _a.sent();
                    if (!device)
                        return [2 /*return*/, res.status(404).send((0, response_1.errorResponse)("Wrong device id", userReq.lang))];
                    if (deviceCheckUnique != null) {
                        if (device.id != deviceCheckUnique.id)
                            return [2 /*return*/, res
                                    .status(404)
                                    .send((0, response_1.errorResponse)("Device id already in use", userReq.lang))];
                    }
                    updateValues = {};
                    if (type)
                        updateValues.type = type;
                    if (osName)
                        updateValues.osName = osName;
                    if (appVersion)
                        updateValues.appVersion = appVersion;
                    if (token)
                        updateValues.token = token;
                    if (pushToken)
                        updateValues.pushToken = pushToken;
                    if (Object.keys(updateValues).length == 0)
                        return [2 /*return*/, res.status(400).send((0, response_1.errorResponse)("Nothing to update", userReq.lang))];
                    return [4 /*yield*/, prisma.device.update({
                            where: { id: idOfDevice },
                            data: updateValues,
                        })];
                case 4:
                    updateDevice = _a.sent();
                    return [2 /*return*/, res.send((0, response_1.successResponse)({ device: updateDevice }, userReq.lang))];
                case 5:
                    e_4 = _a.sent();
                    (0, logger_1.error)(e_4);
                    res.status(500).json((0, response_1.errorResponse)("Server error " + e_4, userReq.lang));
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); });
    router.delete("/:deviceId", adminAuth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, idOfDevice, device, deleteResult, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userReq = req;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    idOfDevice = parseInt(req.params.deviceId);
                    return [4 /*yield*/, prisma.device.findFirst({
                            where: {
                                id: idOfDevice,
                            },
                        })];
                case 2:
                    device = _a.sent();
                    if (!device)
                        return [2 /*return*/, res.status(404).send((0, response_1.errorResponse)("Wrong device id", userReq.lang))];
                    return [4 /*yield*/, prisma.device.delete({
                            where: { id: idOfDevice },
                        })];
                case 3:
                    deleteResult = _a.sent();
                    return [2 /*return*/, res.send((0, response_1.successResponse)("OK", userReq.lang))];
                case 4:
                    e_5 = _a.sent();
                    (0, logger_1.error)(e_5);
                    res.status(500).json((0, response_1.errorResponse)("Server error " + e_5, userReq.lang));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    return router;
});
//# sourceMappingURL=device.js.map