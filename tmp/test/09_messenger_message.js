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
var chai_1 = __importStar(require("chai"));
var supertest_1 = __importDefault(require("supertest"));
var server_1 = __importDefault(require("../server"));
var global_1 = __importDefault(require("./global"));
var Constants = __importStar(require("../server/components/consts"));
var room_1 = __importDefault(require("./fixtures/room"));
var mocha_1 = require("mocha");
var device_1 = require("./fixtures/device");
var user_1 = require("./fixtures/user");
var sendPush_1 = __importDefault(require("../server/services/push/worker/sendPush"));
var utils_1 = require("../client/lib/utils");
describe("API", function () {
    describe("/api/messenger/messages POST", function () {
        var validParams = {};
        var room;
        (0, mocha_1.before)(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, room_1.default)([{ userId: global_1.default.userId, isAdmin: true }])];
                    case 1:
                        room = _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, mocha_1.afterEach)(function () {
            chai_1.default.spy.restore(sendPush_1.default, "run");
        });
        (0, mocha_1.beforeEach)(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                validParams = {
                    roomId: room.id,
                    type: "type",
                    message: {
                        text: "text",
                        mediaUrl: "url",
                    },
                };
                chai_1.default.spy.on(sendPush_1.default, "run", function () { return true; });
                return [2 /*return*/];
            });
        }); });
        it("roomId param is required", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseInvalid, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/messages")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { roomId: undefined }))];
                    case 1:
                        responseInvalid = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/messages")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { roomId: room.id }))];
                    case 2:
                        response = _a.sent();
                        (0, chai_1.expect)(responseInvalid.status).to.eqls(400);
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("roomId param can be only number", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseInvalid, responseInvalidString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/messages")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { roomId: [42] }))];
                    case 1:
                        responseInvalid = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/messages")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { roomId: "notNum" }))];
                    case 2:
                        responseInvalidString = _a.sent();
                        (0, chai_1.expect)(responseInvalid.status).to.eqls(400);
                        (0, chai_1.expect)(responseInvalidString.status).to.eqls(400);
                        return [2 /*return*/];
                }
            });
        }); });
        it("returns error if room with given id doesn't exist", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseInvalid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/messages")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { roomId: 42080 }))];
                    case 1:
                        responseInvalid = _a.sent();
                        (0, chai_1.expect)(responseInvalid.status).to.eqls(400);
                        return [2 /*return*/];
                }
            });
        }); });
        it("type param is required", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseInvalid, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/messages")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { type: undefined }))];
                    case 1:
                        responseInvalid = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/messages")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { type: "string" }))];
                    case 2:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(responseInvalid.status).to.eqls(400);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("type param can only be string", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseInvalidOne, responseInvalidTwo, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/messages")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { type: true }))];
                    case 1:
                        responseInvalidOne = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/messages")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { type: [1] }))];
                    case 2:
                        responseInvalidTwo = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/messages")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { type: "type" }))];
                    case 3:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(responseInvalidOne.status).to.eqls(400);
                        (0, chai_1.expect)(responseInvalidTwo.status).to.eqls(400);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("creates message model", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, messageFromResponse, messageFromDb;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/messages")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(validParams)];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("message");
                        messageFromResponse = response.body.data.message;
                        return [4 /*yield*/, global_1.default.prisma.message.findUnique({
                                where: { id: messageFromResponse.id },
                            })];
                    case 2:
                        messageFromDb = _a.sent();
                        (0, chai_1.expect)(JSON.stringify(messageFromResponse)).to.eqls(JSON.stringify(messageFromDb));
                        return [2 /*return*/];
                }
            });
        }); });
        it("creates deviceMessage for every users device", function () { return __awaiter(void 0, void 0, void 0, function () {
            var users, userIds, room, response, message, devices, deviceIds, deviceMessages, deviceMessageIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.createManyFakeUsers)(2)];
                    case 1:
                        users = _a.sent();
                        userIds = users.map(function (u) { return u.id; });
                        return [4 /*yield*/, (0, device_1.createFakeDevices)(userIds)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, room_1.default)(__spreadArray([
                                { userId: global_1.default.userId, isAdmin: true }
                            ], users.map(function (u) { return ({ userId: u.id }); }), true))];
                    case 3:
                        room = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/messages")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { roomId: room.id }))];
                    case 4:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("message");
                        // this is because we create device messages after we send response
                        return [4 /*yield*/, (0, utils_1.wait)(0.05)];
                    case 5:
                        // this is because we create device messages after we send response
                        _a.sent();
                        message = response.body.data.message;
                        return [4 /*yield*/, global_1.default.prisma.device.findMany({
                                where: { userId: { in: __spreadArray(__spreadArray([], userIds, true), [global_1.default.userId], false) } },
                            })];
                    case 6:
                        devices = _a.sent();
                        deviceIds = devices.map(function (d) { return d.id; });
                        return [4 /*yield*/, global_1.default.prisma.deviceMessage.findMany({
                                where: { messageId: message.id },
                            })];
                    case 7:
                        deviceMessages = _a.sent();
                        deviceMessageIds = deviceMessages.map(function (d) { return d.deviceId; });
                        (0, chai_1.expect)(deviceMessageIds).to.include.members(deviceIds);
                        (0, chai_1.expect)(message.totalDeviceCount).to.eqls(devices.length);
                        return [2 /*return*/];
                }
            });
        }); });
        it("every deviceMessage contains info about sender", function () { return __awaiter(void 0, void 0, void 0, function () {
            var users, userIds, room, response, message, deviceMessages, fromDevice;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.createManyFakeUsers)(2)];
                    case 1:
                        users = _a.sent();
                        userIds = users.map(function (u) { return u.id; });
                        return [4 /*yield*/, (0, device_1.createFakeDevices)(userIds)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, room_1.default)(__spreadArray([
                                { userId: global_1.default.userId, isAdmin: true }
                            ], users.map(function (u) { return ({ userId: u.id }); }), true))];
                    case 3:
                        room = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/messages")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { roomId: room.id }))];
                    case 4:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("message");
                        return [4 /*yield*/, (0, utils_1.wait)(0.05)];
                    case 5:
                        _a.sent();
                        message = response.body.data.message;
                        return [4 /*yield*/, global_1.default.prisma.deviceMessage.findMany({
                                where: { messageId: message.id },
                            })];
                    case 6:
                        deviceMessages = _a.sent();
                        return [4 /*yield*/, global_1.default.prisma.device.findFirst({
                                where: { userId: global_1.default.userId },
                            })];
                    case 7:
                        fromDevice = _a.sent();
                        (0, chai_1.expect)(deviceMessages.every(function (dm) { return dm.fromUserId === global_1.default.userId && dm.fromDeviceId === fromDevice.id; })).to.eqls(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it("every deviceMessage contains messageBody", function () { return __awaiter(void 0, void 0, void 0, function () {
            var users, userIds, room, response, message, deviceMessages, messageBodies;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.createManyFakeUsers)(2)];
                    case 1:
                        users = _a.sent();
                        userIds = users.map(function (u) { return u.id; });
                        return [4 /*yield*/, (0, device_1.createFakeDevices)(userIds)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, room_1.default)(__spreadArray([
                                { userId: global_1.default.userId, isAdmin: true }
                            ], users.map(function (u) { return ({ userId: u.id }); }), true))];
                    case 3:
                        room = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/messages")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { roomId: room.id }))];
                    case 4:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("message");
                        return [4 /*yield*/, (0, utils_1.wait)(0.05)];
                    case 5:
                        _a.sent();
                        message = response.body.data.message;
                        return [4 /*yield*/, global_1.default.prisma.deviceMessage.findMany({
                                where: { messageId: message.id },
                            })];
                    case 6:
                        deviceMessages = _a.sent();
                        messageBodies = deviceMessages.map(function (dm) { return dm.messageBody; });
                        (0, chai_1.expect)(messageBodies.every(function (m) {
                            return m.text === validParams.message.text &&
                                m.mediaUrl === validParams.message.mediaUrl;
                        })).to.eqls(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it("every deviceMessage contains action", function () { return __awaiter(void 0, void 0, void 0, function () {
            var users, userIds, room, response, message, deviceMessages, actions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.createManyFakeUsers)(2)];
                    case 1:
                        users = _a.sent();
                        userIds = users.map(function (u) { return u.id; });
                        return [4 /*yield*/, (0, device_1.createFakeDevices)(userIds)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, room_1.default)(__spreadArray([
                                { userId: global_1.default.userId, isAdmin: true }
                            ], users.map(function (u) { return ({ userId: u.id }); }), true))];
                    case 3:
                        room = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/messages")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { roomId: room.id }))];
                    case 4:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("message");
                        return [4 /*yield*/, (0, utils_1.wait)(0.05)];
                    case 5:
                        _a.sent();
                        message = response.body.data.message;
                        return [4 /*yield*/, global_1.default.prisma.deviceMessage.findMany({
                                where: { messageId: message.id },
                            })];
                    case 6:
                        deviceMessages = _a.sent();
                        actions = deviceMessages.map(function (dm) { return dm.action; });
                        (0, chai_1.expect)(actions.every(function (a) { return a === Constants.MESSAGE_ACTION_NEW_MESSAGE; })).to.eqls(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it("sends  push for every deviceMessage", function () { return __awaiter(void 0, void 0, void 0, function () {
            var users, userIds, room, response, message, deviceMessagesCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.createManyFakeUsers)(2)];
                    case 1:
                        users = _a.sent();
                        userIds = users.map(function (u) { return u.id; });
                        return [4 /*yield*/, (0, device_1.createFakeDevices)(userIds)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, room_1.default)(__spreadArray([
                                { userId: global_1.default.userId, isAdmin: true }
                            ], users.map(function (u) { return ({ userId: u.id }); }), true))];
                    case 3:
                        room = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/messages")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { roomId: room.id }))];
                    case 4:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("message");
                        return [4 /*yield*/, (0, utils_1.wait)(0.05)];
                    case 5:
                        _a.sent();
                        message = response.body.data.message;
                        return [4 /*yield*/, global_1.default.prisma.deviceMessage.count({
                                where: { messageId: message.id },
                            })];
                    case 6:
                        deviceMessagesCount = _a.sent();
                        (0, chai_1.expect)(sendPush_1.default.run).to.have.been.called.min(deviceMessagesCount);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=09_messenger_message.js.map