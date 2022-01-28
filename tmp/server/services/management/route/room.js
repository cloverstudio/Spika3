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
var consts = __importStar(require("../../../components/consts"));
var logger_1 = require("../../../components/logger");
var response_1 = require("../../../components/response");
exports.default = (function (params) {
    var router = (0, express_1.Router)();
    router.post("/", adminAuth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, name_1, type, avatarUrl, deleted, newRoom, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userReq = req;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    name_1 = req.body.name;
                    type = req.body.type;
                    avatarUrl = req.body.avatarUrl;
                    deleted = req.body.verified;
                    if (!name_1)
                        return [2 /*return*/, res.status(400).send((0, response_1.errorResponse)("Name is required", userReq.lang))];
                    if (!type)
                        return [2 /*return*/, res.status(400).send((0, response_1.errorResponse)("Type id is required", userReq.lang))];
                    return [4 /*yield*/, prisma.room.create({
                            data: {
                                name: name_1,
                                type: type,
                                avatarUrl: avatarUrl,
                                deleted: deleted,
                            },
                        })];
                case 2:
                    newRoom = _a.sent();
                    return [2 /*return*/, res.send((0, response_1.successResponse)({ room: newRoom }, userReq.lang))];
                case 3:
                    e_1 = _a.sent();
                    (0, logger_1.error)(e_1);
                    res.status(500).json((0, response_1.errorResponse)("Server error " + e_1, userReq.lang));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    /**
     * TODO: impliment order
     */
    router.get("/", adminAuth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, page, userId, deleted, rooms, clause, count, _a, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    userReq = req;
                    page = parseInt(req.query.page ? req.query.page : "") || 0;
                    userId = parseInt(req.query.userId ? req.query.userId : "") || 0;
                    deleted = req.query.deleted == "true";
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 11, , 12]);
                    rooms = null;
                    if (!(userId == 0)) return [3 /*break*/, 3];
                    clause = !deleted ? {} : { deleted: true };
                    return [4 /*yield*/, prisma.room.findMany({
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
                    rooms = _b.sent();
                    return [3 /*break*/, 7];
                case 3:
                    if (!!deleted) return [3 /*break*/, 5];
                    return [4 /*yield*/, prisma.room.findMany({
                            where: {
                                users: {
                                    some: {
                                        user: {
                                            id: userId,
                                        },
                                    },
                                },
                            },
                            skip: consts.PAGING_LIMIT * page,
                            take: consts.PAGING_LIMIT,
                        })];
                case 4:
                    rooms = _b.sent();
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, prisma.room.findMany({
                        where: {
                            deleted: true,
                            users: {
                                some: {
                                    user: {
                                        id: userId,
                                    },
                                },
                            },
                        },
                        skip: consts.PAGING_LIMIT * page,
                        take: consts.PAGING_LIMIT,
                    })];
                case 6:
                    rooms = _b.sent();
                    _b.label = 7;
                case 7:
                    if (!(userId == 0 && !deleted)) return [3 /*break*/, 9];
                    return [4 /*yield*/, prisma.room.count()];
                case 8:
                    _a = _b.sent();
                    return [3 /*break*/, 10];
                case 9:
                    _a = rooms.length;
                    _b.label = 10;
                case 10:
                    count = _a;
                    res.send((0, response_1.successResponse)({
                        list: rooms,
                        count: count,
                        limit: consts.PAGING_LIMIT,
                    }, userReq.lang));
                    return [3 /*break*/, 12];
                case 11:
                    e_2 = _b.sent();
                    (0, logger_1.error)(e_2);
                    res.status(500).json((0, response_1.errorResponse)("Server error " + e_2, userReq.lang));
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    }); });
    router.get("/:roomId", adminAuth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, roomId, room, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userReq = req;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    roomId = parseInt(req.params.roomId);
                    return [4 /*yield*/, prisma.room.findFirst({
                            where: {
                                id: roomId,
                            },
                        })];
                case 2:
                    room = _a.sent();
                    if (!room)
                        return [2 /*return*/, res.status(404).send((0, response_1.errorResponse)("Wrong room id", userReq.lang))];
                    return [2 /*return*/, res.send((0, response_1.successResponse)({ room: room }, userReq.lang))];
                case 3:
                    e_3 = _a.sent();
                    (0, logger_1.error)(e_3);
                    res.status(500).json((0, response_1.errorResponse)("Server error " + e_3, userReq.lang));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    router.put("/:roomId", adminAuth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, roomId, name_2, type, avatarUrl, deleted, room, updateValues, updateRoom, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userReq = req;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    roomId = parseInt(req.params.roomId);
                    name_2 = req.body.name;
                    type = req.body.type;
                    avatarUrl = req.body.avatarUrl;
                    deleted = req.body.deleted;
                    return [4 /*yield*/, prisma.room.findFirst({
                            where: {
                                id: roomId,
                            },
                        })];
                case 2:
                    room = _a.sent();
                    if (!room)
                        return [2 /*return*/, res.status(404).send((0, response_1.errorResponse)("Wrong room id", userReq.lang))];
                    if (!name_2)
                        return [2 /*return*/, res.status(400).send((0, response_1.errorResponse)("Name is required", userReq.lang))];
                    if (!type)
                        return [2 /*return*/, res.status(400).send((0, response_1.errorResponse)("Type id is required", userReq.lang))];
                    updateValues = {};
                    if (name_2)
                        updateValues.name = name_2;
                    if (type)
                        updateValues.type = type;
                    if (avatarUrl)
                        updateValues.avatarUrl = avatarUrl;
                    if (deleted != null)
                        updateValues.deleted = deleted;
                    if (Object.keys(updateValues).length == 0)
                        return [2 /*return*/, res.status(400).send((0, response_1.errorResponse)("Nothing to update", userReq.lang))];
                    return [4 /*yield*/, prisma.room.update({
                            where: { id: roomId },
                            data: updateValues,
                        })];
                case 3:
                    updateRoom = _a.sent();
                    return [2 /*return*/, res.send((0, response_1.successResponse)({ room: updateRoom }, userReq.lang))];
                case 4:
                    e_4 = _a.sent();
                    (0, logger_1.error)(e_4);
                    res.status(500).json((0, response_1.errorResponse)("Server error " + e_4, userReq.lang));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    router.delete("/:roomId", adminAuth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, roomId, room, deleteResult, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userReq = req;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    roomId = parseInt(req.params.roomId);
                    return [4 /*yield*/, prisma.room.findFirst({
                            where: {
                                id: roomId,
                            },
                        })];
                case 2:
                    room = _a.sent();
                    if (!room)
                        return [2 /*return*/, res.status(404).send((0, response_1.errorResponse)("Wrong room id", userReq.lang))];
                    return [4 /*yield*/, prisma.room.delete({
                            where: { id: roomId },
                        })];
                case 3:
                    deleteResult = _a.sent();
                    return [2 /*return*/, res.send((0, response_1.successResponse)("Room deleted", userReq.lang))];
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
//# sourceMappingURL=room.js.map