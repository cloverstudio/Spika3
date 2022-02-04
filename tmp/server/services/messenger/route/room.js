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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
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
var Constants = __importStar(require("../../../components/consts"));
var sanitize_1 = __importDefault(require("../../../components/sanitize"));
var prisma = new client_1.PrismaClient();
var postRoomSchema = yup.object().shape({
    body: yup.object().shape({
        name: yup.string().default(""),
        avatarUrl: yup.string().default(""),
        type: yup.string().strict(),
        userIds: yup.array().default([]).of(yup.number().strict().moreThan(0)),
        adminUserIds: yup.array().default([]).of(yup.number().strict().moreThan(0)),
    }),
});
var patchRoomSchema = yup.object().shape({
    body: yup.object().shape({
        name: yup.string().strict(),
        avatarUrl: yup.string().strict(),
        type: yup.string().strict(),
        userIds: yup.array().of(yup.number().moreThan(0)).strict(),
        adminUserIds: yup.array().of(yup.number().moreThan(0)).strict(),
    }),
});
var leaveRoomSchema = yup.object().shape({
    body: yup.object().shape({
        adminUserIds: yup.array().of(yup.number().moreThan(0)).strict(),
    }),
});
exports.default = (function () {
    var router = (0, express_1.Router)();
    router.post("/", auth_1.default, (0, validateMiddleware_1.default)(postRoomSchema), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, _a, avatarUrl, userDefinedType, userIds, adminUserIds_1, userDefinedName, foundUsers, users, type, name_1, existingRoom, room, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    userReq = req;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, , 7]);
                    _a = req.body, avatarUrl = _a.avatarUrl, userDefinedType = _a.type, userIds = _a.userIds, adminUserIds_1 = _a.adminUserIds, userDefinedName = _a.name;
                    if (!adminUserIds_1.includes(userReq.user.id)) {
                        adminUserIds_1.push(userReq.user.id);
                    }
                    return [4 /*yield*/, prisma.user.findMany({
                            where: { id: { in: __spreadArray(__spreadArray([], userIds, true), adminUserIds_1, true) } },
                        })];
                case 2:
                    foundUsers = _b.sent();
                    users = foundUsers.map(function (user) { return ({
                        userId: user.id,
                        isAdmin: adminUserIds_1.includes(user.id) || false,
                    }); });
                    type = userDefinedType || (userIds.length < 3 ? "private" : "group");
                    name_1 = getRoomName(userDefinedName, users.length);
                    if (!(users.length === 2 && type === "private")) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.room.findFirst({
                            where: {
                                users: {
                                    every: { userId: { in: users.map(function (u) { return u.userId; }) } },
                                },
                                type: type,
                            },
                            include: {
                                users: true,
                            },
                        })];
                case 3:
                    existingRoom = _b.sent();
                    if (existingRoom) {
                        return [2 /*return*/, res.status(409).send((0, response_1.errorResponse)("Room already exists", userReq.lang))];
                    }
                    _b.label = 4;
                case 4: return [4 /*yield*/, prisma.room.create({
                        data: {
                            name: name_1,
                            type: type,
                            avatarUrl: avatarUrl,
                            users: {
                                create: users,
                            },
                        },
                        include: {
                            users: true,
                        },
                    })];
                case 5:
                    room = _b.sent();
                    res.send((0, response_1.successResponse)({ room: room }, userReq.lang));
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _b.sent();
                    (0, logger_1.error)(e_1);
                    res.status(500).send((0, response_1.errorResponse)("Server error " + e_1, userReq.lang));
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); });
    router.put("/:id", auth_1.default, (0, validateMiddleware_1.default)(patchRoomSchema), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, id, _a, userIds, adminUserIds, name_2, avatarUrl, room, userIsAdmin, shouldUpdateUsers, shouldUpdateAdminUsers, userCount, update, updated, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    userReq = req;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 9, , 10]);
                    id = parseInt(req.params.id || "");
                    _a = req.body, userIds = _a.userIds, adminUserIds = _a.adminUserIds, name_2 = _a.name, avatarUrl = _a.avatarUrl;
                    return [4 /*yield*/, prisma.room.findFirst({ where: { id: id }, include: { users: true } })];
                case 2:
                    room = _b.sent();
                    if (!room) {
                        return [2 /*return*/, res.status(404).send((0, response_1.errorResponse)("Not found", userReq.lang))];
                    }
                    userIsAdmin = isAdminCheck(userReq.user.id, room.users);
                    if (!userIsAdmin) {
                        return [2 /*return*/, res.status(403).send((0, response_1.errorResponse)("Forbidden", userReq.lang))];
                    }
                    shouldUpdateUsers = typeof userIds !== "undefined";
                    shouldUpdateAdminUsers = typeof adminUserIds !== "undefined";
                    if (!shouldUpdateUsers) return [3 /*break*/, 4];
                    return [4 /*yield*/, updateRoomUsers({ newIds: userIds, room: room })];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    if (!shouldUpdateAdminUsers) return [3 /*break*/, 6];
                    if (!adminUserIds.includes(userReq.user.id)) {
                        adminUserIds.push(userReq.user.id);
                    }
                    return [4 /*yield*/, updateRoomUsers({ room: room, newIds: adminUserIds, updatingAdmins: true })];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6: return [4 /*yield*/, prisma.roomUser.count({ where: { roomId: id } })];
                case 7:
                    userCount = _b.sent();
                    update = __assign(__assign(__assign({}, (name_2 && { name: name_2 })), (avatarUrl && { avatarUrl: avatarUrl })), (userCount > 2 && { type: "group" }));
                    return [4 /*yield*/, prisma.room.update({
                            where: { id: id },
                            data: update,
                            include: { users: true },
                        })];
                case 8:
                    updated = _b.sent();
                    res.send((0, response_1.successResponse)({ room: updated }, userReq.lang));
                    return [3 /*break*/, 10];
                case 9:
                    e_2 = _b.sent();
                    (0, logger_1.error)(e_2);
                    res.status(500).send((0, response_1.errorResponse)("Server error " + e_2, userReq.lang));
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    }); });
    router.delete("/:id", auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, id, room, userIsAdmin, updated, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userReq = req;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    id = parseInt(req.params.id || "");
                    return [4 /*yield*/, prisma.room.findFirst({ where: { id: id }, include: { users: true } })];
                case 2:
                    room = _a.sent();
                    if (!room) {
                        return [2 /*return*/, res.status(404).send((0, response_1.errorResponse)("Not found", userReq.lang))];
                    }
                    userIsAdmin = isAdminCheck(userReq.user.id, room.users);
                    if (!userIsAdmin) {
                        return [2 /*return*/, res.status(403).send((0, response_1.errorResponse)("Forbidden", userReq.lang))];
                    }
                    return [4 /*yield*/, prisma.room.update({
                            where: { id: id },
                            data: { deleted: true },
                            include: { users: true },
                        })];
                case 3:
                    updated = _a.sent();
                    res.send((0, response_1.successResponse)({ room: updated }, userReq.lang));
                    return [3 /*break*/, 5];
                case 4:
                    e_3 = _a.sent();
                    (0, logger_1.error)(e_3);
                    res.status(500).send((0, response_1.errorResponse)("Server error " + e_3, userReq.lang));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    router.post("/:id/leave", (0, validateMiddleware_1.default)(leaveRoomSchema), auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, id, adminUserIds, room, isRoomUser, canLeaveRoom, roomUserId, updated_1, foundUsers, foundUsersIds_1, roomUsersToPromote, updated, e_4;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    userReq = req;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, , 8]);
                    id = parseInt(req.params.id || "");
                    adminUserIds = req.body.adminUserIds;
                    return [4 /*yield*/, prisma.room.findFirst({
                            where: { id: id },
                            include: { users: true },
                        })];
                case 2:
                    room = _b.sent();
                    if (!room) {
                        return [2 /*return*/, res.status(404).send((0, response_1.errorResponse)("Not found", userReq.lang))];
                    }
                    isRoomUser = isRoomUserCheck(userReq.user.id, room.users);
                    if (!isRoomUser) {
                        return [2 /*return*/, res.status(404).send((0, response_1.errorResponse)("Not found", userReq.lang))];
                    }
                    canLeaveRoom = canLeaveRoomCheck(userReq.user.id, room.users);
                    roomUserId = (_a = room.users.find(function (u) { return u.userId === userReq.user.id; })) === null || _a === void 0 ? void 0 : _a.id;
                    if (!canLeaveRoom) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.room.update({
                            where: { id: id },
                            data: {
                                users: {
                                    deleteMany: [{ id: roomUserId }],
                                },
                            },
                            include: { users: true },
                        })];
                case 3:
                    updated_1 = _b.sent();
                    return [2 /*return*/, res.send((0, response_1.successResponse)({ room: updated_1 }, userReq.lang))];
                case 4:
                    if (!adminUserIds) {
                        return [2 /*return*/, res
                                .status(400)
                                .send((0, response_1.errorResponse)("New admin(s) must be defined", userReq.lang))];
                    }
                    return [4 /*yield*/, prisma.user.findMany({
                            where: { id: { in: adminUserIds } },
                        })];
                case 5:
                    foundUsers = _b.sent();
                    if (!foundUsers.length) {
                        return [2 /*return*/, res
                                .status(400)
                                .send((0, response_1.errorResponse)("New admin(s) must be defined", userReq.lang))];
                    }
                    foundUsersIds_1 = foundUsers.map(function (u) { return u.id; });
                    roomUsersToPromote = room.users.filter(function (u) {
                        return foundUsersIds_1.includes(u.userId);
                    });
                    return [4 /*yield*/, prisma.room.update({
                            where: { id: id },
                            data: {
                                users: {
                                    deleteMany: __spreadArray([
                                        { id: roomUserId }
                                    ], roomUsersToPromote.map(function (u) { return ({ id: u.id }); }), true),
                                    createMany: {
                                        data: foundUsersIds_1.map(function (userId) { return ({
                                            userId: userId,
                                            isAdmin: true,
                                        }); }),
                                    },
                                },
                            },
                            include: { users: true },
                        })];
                case 6:
                    updated = _b.sent();
                    res.send((0, response_1.successResponse)({ room: updated }, userReq.lang));
                    return [3 /*break*/, 8];
                case 7:
                    e_4 = _b.sent();
                    (0, logger_1.error)(e_4);
                    res.status(500).send((0, response_1.errorResponse)("Server error " + e_4, userReq.lang));
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); });
    router.get("/", auth_1.default, (0, validateMiddleware_1.default)(postRoomSchema), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, page, rooms, count, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userReq = req;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    page = parseInt(req.query.page ? req.query.page : "") || 1;
                    return [4 /*yield*/, prisma.room.findMany({
                            where: {
                                users: {
                                    some: {
                                        userId: userReq.user.id,
                                    },
                                },
                            },
                            include: {
                                users: true,
                            },
                            orderBy: [
                                {
                                    createdAt: "asc",
                                },
                            ],
                            skip: Constants.PAGING_LIMIT * (page - 1),
                            take: Constants.PAGING_LIMIT,
                        })];
                case 2:
                    rooms = _a.sent();
                    return [4 /*yield*/, prisma.room.count({
                            where: {
                                users: {
                                    some: {
                                        userId: userReq.user.id,
                                    },
                                },
                            },
                        })];
                case 3:
                    count = _a.sent();
                    res.send((0, response_1.successResponse)({
                        list: rooms.map(function (room) { return (0, sanitize_1.default)(room).room(); }),
                        count: count,
                        limit: Constants.PAGING_LIMIT,
                    }, userReq.lang));
                    return [3 /*break*/, 5];
                case 4:
                    e_5 = _a.sent();
                    (0, logger_1.error)(e_5);
                    res.status(500).send((0, response_1.errorResponse)("Server error " + e_5, userReq.lang));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    router.get("/:id", auth_1.default, (0, validateMiddleware_1.default)(postRoomSchema), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, id, room, e_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userReq = req;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    id = parseInt(req.params.id || "");
                    return [4 /*yield*/, prisma.room.findFirst({
                            where: {
                                id: id,
                                users: {
                                    some: {
                                        userId: userReq.user.id,
                                    },
                                },
                            },
                            include: {
                                users: true,
                            },
                        })];
                case 2:
                    room = _a.sent();
                    if (!room) {
                        return [2 /*return*/, res.status(404).send((0, response_1.errorResponse)("Room not found", userReq.lang))];
                    }
                    res.send((0, response_1.successResponse)({ room: (0, sanitize_1.default)(room).room() }, userReq.lang));
                    return [3 /*break*/, 4];
                case 3:
                    e_6 = _a.sent();
                    (0, logger_1.error)(e_6);
                    res.status(500).send((0, response_1.errorResponse)("Server error " + e_6, userReq.lang));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    return router;
});
function getRoomName(initialName, usersCount) {
    if (initialName) {
        return initialName;
    }
    switch (usersCount) {
        case 1: {
            return "Private room";
        }
        case 2: {
            return "";
        }
        default: {
            return "United room";
        }
    }
}
function isAdminCheck(userId, roomUsers) {
    return roomUsers
        .filter(function (u) { return u.isAdmin; })
        .map(function (u) { return u.userId; })
        .includes(userId);
}
function isRoomUserCheck(userId, roomUsers) {
    return roomUsers.map(function (u) { return u.userId; }).includes(userId);
}
function canLeaveRoomCheck(userId, roomUsers) {
    var roomUser = roomUsers.find(function (u) { return u.userId === userId; });
    if (!roomUser.isAdmin) {
        return true;
    }
    var adminCount = roomUsers.filter(function (u) { return u.isAdmin; }).length;
    if (adminCount > 1) {
        return true;
    }
    return false;
}
function updateRoomUsers(_a) {
    var newIds = _a.newIds, room = _a.room, _b = _a.updatingAdmins, updatingAdmins = _b === void 0 ? false : _b;
    return __awaiter(this, void 0, void 0, function () {
        var currentIds, foundUsers, foundUserIds, userIdsToRemove, userIdsToAdd;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    currentIds = room.users.filter(function (u) { return u.isAdmin === updatingAdmins; }).map(function (u) { return u.userId; });
                    return [4 /*yield*/, prisma.user.findMany({
                            where: { id: { in: newIds } },
                            select: { id: true },
                        })];
                case 1:
                    foundUsers = _c.sent();
                    foundUserIds = foundUsers.map(function (u) { return u.id; });
                    userIdsToRemove = currentIds.filter(function (id) { return !foundUserIds.includes(id); });
                    return [4 /*yield*/, prisma.roomUser.deleteMany({
                            where: { userId: { in: userIdsToRemove }, isAdmin: updatingAdmins },
                        })];
                case 2:
                    _c.sent();
                    userIdsToAdd = foundUserIds.filter(function (id) { return !currentIds.includes(id); });
                    return [4 /*yield*/, prisma.roomUser.createMany({
                            data: userIdsToAdd.map(function (userId) { return ({ userId: userId, roomId: room.id, isAdmin: updatingAdmins }); }),
                        })];
                case 3:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=room.js.map