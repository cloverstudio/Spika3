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
var chai_1 = require("chai");
var supertest_1 = __importDefault(require("supertest"));
var server_1 = __importDefault(require("../server"));
var global_1 = __importDefault(require("./global"));
var room_1 = __importDefault(require("./fixtures/room"));
var mocha_1 = require("mocha");
var user_1 = __importStar(require("./fixtures/user"));
describe("API", function () {
    describe("/api/messenger/rooms POST", function () {
        var validParams = {};
        (0, mocha_1.beforeEach)(function () {
            validParams = {
                name: "string",
                type: "type",
                userIds: [1, 2, 3],
                adminUserIds: [1, 2, 3],
                avatarUrl: "/url/avatar",
            };
        });
        it("name param can be only string", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, responseInvalidNotString, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/rooms")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { name: undefined }))];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { name: [42] }))];
                    case 2:
                        responseInvalidNotString = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { name: "string" }))];
                    case 3:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(responseInvalidNotString.status).to.eqls(400);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("userIds param can only be array", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, responseInvalidNotArray, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/rooms")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { userIds: undefined }))];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { userIds: 42 }))];
                    case 2:
                        responseInvalidNotArray = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { userIds: [1] }))];
                    case 3:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(responseInvalidNotArray.status).to.eqls(400);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Requires userIds array to contain numbers", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseInvalid, responseInvalidTwo, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/rooms")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { userIds: ["string"] }))];
                    case 1:
                        responseInvalid = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { userIds: [true] }))];
                    case 2:
                        responseInvalidTwo = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { userIds: [1] }))];
                    case 3:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(responseInvalid.status).to.eqls(400);
                        (0, chai_1.expect)(responseInvalidTwo.status).to.eqls(400);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("adminUserIds param can only be array", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, responseInvalidNotArray, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/rooms")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { adminUserIds: undefined }))];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { adminUserIds: 42 }))];
                    case 2:
                        responseInvalidNotArray = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { adminUserIds: [1] }))];
                    case 3:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(responseInvalidNotArray.status).to.eqls(400);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Requires adminUserIds array to contain numbers", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseInvalid, responseInvalidTwo, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/rooms")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { adminUserIds: ["string"] }))];
                    case 1:
                        responseInvalid = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { adminUserIds: [true] }))];
                    case 2:
                        responseInvalidTwo = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { adminUserIds: [1] }))];
                    case 3:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(responseInvalid.status).to.eqls(400);
                        (0, chai_1.expect)(responseInvalidTwo.status).to.eqls(400);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("avatarUrl param can be only string", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseUndefined, responseInvalidNotString, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/rooms")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { avatarUrl: undefined }))];
                    case 1:
                        responseUndefined = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { avatarUrl: [42] }))];
                    case 2:
                        responseInvalidNotString = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { avatarUrl: "string" }))];
                    case 3:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(responseUndefined.status).to.eqls(200);
                        (0, chai_1.expect)(responseInvalidNotString.status).to.eqls(400);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("type param can be only string", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseUndefined, responseInvalidNotString, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/rooms")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { type: undefined }))];
                    case 1:
                        responseUndefined = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { type: 42 }))];
                    case 2:
                        responseInvalidNotString = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { type: "string" }))];
                    case 3:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(responseUndefined.status).to.eqls(200);
                        (0, chai_1.expect)(responseInvalidNotString.status).to.eqls(400);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("sets defined name", function () { return __awaiter(void 0, void 0, void 0, function () {
            var name, responseWithName, roomFromRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = "Crazy room";
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { name: name }))];
                    case 1:
                        responseWithName = _a.sent();
                        (0, chai_1.expect)(responseWithName.status).to.eqls(200);
                        (0, chai_1.expect)(responseWithName.body).to.has.property("data");
                        (0, chai_1.expect)(responseWithName.body.data).to.has.property("room");
                        roomFromRes = responseWithName.body.data.room;
                        (0, chai_1.expect)(roomFromRes.name).to.eqls(name);
                        return [2 /*return*/];
                }
            });
        }); });
        it("sets name to 'Private room' when only one user", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, roomFromRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/rooms")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { name: undefined, userIds: [], adminUserIds: [] }))];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("room");
                        roomFromRes = response.body.data.room;
                        (0, chai_1.expect)(roomFromRes.name).to.eqls("Private room");
                        return [2 /*return*/];
                }
            });
        }); });
        it("sets name to empty string when only two users", function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, response, roomFromRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.default)()];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { name: undefined, userIds: [user.id], adminUserIds: [] }))];
                    case 2:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("room");
                        roomFromRes = response.body.data.room;
                        (0, chai_1.expect)(roomFromRes.name).to.eqls("");
                        return [2 /*return*/];
                }
            });
        }); });
        it("sets name to 'United room' when more than two users", function () { return __awaiter(void 0, void 0, void 0, function () {
            var users, response, roomFromRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.createManyFakeUsers)(2)];
                    case 1:
                        users = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { name: undefined, userIds: users.map(function (u) { return u.id; }), adminUserIds: [] }))];
                    case 2:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("room");
                        roomFromRes = response.body.data.room;
                        (0, chai_1.expect)(roomFromRes.name).to.eqls("United room");
                        return [2 /*return*/];
                }
            });
        }); });
        it("ignores users that doesn't exist", function () { return __awaiter(void 0, void 0, void 0, function () {
            var userIds, adminUserIds, responseWithFakeUsers, roomFromRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userIds = [99999, 8585588];
                        adminUserIds = [991999, 85785588];
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { userIds: userIds, adminUserIds: adminUserIds }))];
                    case 1:
                        responseWithFakeUsers = _a.sent();
                        (0, chai_1.expect)(responseWithFakeUsers.status).to.eqls(200);
                        (0, chai_1.expect)(responseWithFakeUsers.body).to.has.property("data");
                        (0, chai_1.expect)(responseWithFakeUsers.body.data).to.has.property("room");
                        roomFromRes = responseWithFakeUsers.body.data.room;
                        (0, chai_1.expect)(roomFromRes.users).to.be.an("array");
                        (0, chai_1.expect)(roomFromRes.users.some(function (u) {
                            return __spreadArray(__spreadArray([], userIds, true), adminUserIds, true).includes(u.id);
                        })).to.eqls(false);
                        return [2 /*return*/];
                }
            });
        }); });
        it("adds user as admin", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseWithFakeUsers, roomFromRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/rooms")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { userIds: [], adminUserIds: [] }))];
                    case 1:
                        responseWithFakeUsers = _a.sent();
                        (0, chai_1.expect)(responseWithFakeUsers.status).to.eqls(200);
                        (0, chai_1.expect)(responseWithFakeUsers.body).to.has.property("data");
                        (0, chai_1.expect)(responseWithFakeUsers.body.data).to.has.property("room");
                        roomFromRes = responseWithFakeUsers.body.data.room;
                        (0, chai_1.expect)(roomFromRes).to.has.property("users");
                        (0, chai_1.expect)(roomFromRes.users).to.be.an("array");
                        (0, chai_1.expect)(roomFromRes.users.filter(function (u) { return u.isAdmin; }).map(function (u) { return u.userId; }))
                            .to.be.an("array")
                            .that.does.include(global_1.default.userId);
                        return [2 /*return*/];
                }
            });
        }); });
        it("sets defined type", function () { return __awaiter(void 0, void 0, void 0, function () {
            var type, response, roomFromRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        type = "custom";
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { type: type }))];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("room");
                        roomFromRes = response.body.data.room;
                        (0, chai_1.expect)(roomFromRes.type).to.eqls(type);
                        return [2 /*return*/];
                }
            });
        }); });
        it("sets type as private when appropriate", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseOne, user, responseTwo, type, responseThree;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/rooms")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { type: undefined, userIds: [] }))];
                    case 1:
                        responseOne = _a.sent();
                        (0, chai_1.expect)(responseOne.status).to.eqls(200);
                        (0, chai_1.expect)(responseOne.body).to.has.property("data");
                        (0, chai_1.expect)(responseOne.body.data).to.has.property("room");
                        (0, chai_1.expect)(responseOne.body.data.room.type).to.eqls("private");
                        return [4 /*yield*/, (0, user_1.default)()];
                    case 2:
                        user = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { type: undefined, userIds: [user.id] }))];
                    case 3:
                        responseTwo = _a.sent();
                        (0, chai_1.expect)(responseTwo.status).to.eqls(200);
                        (0, chai_1.expect)(responseTwo.body).to.has.property("data");
                        (0, chai_1.expect)(responseTwo.body.data).to.has.property("room");
                        (0, chai_1.expect)(responseTwo.body.data.room.type).to.eqls("private");
                        type = "defined";
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { type: type, userIds: [user.id] }))];
                    case 4:
                        responseThree = _a.sent();
                        (0, chai_1.expect)(responseThree.status).to.eqls(200);
                        (0, chai_1.expect)(responseThree.body).to.has.property("data");
                        (0, chai_1.expect)(responseThree.body.data).to.has.property("room");
                        (0, chai_1.expect)(responseThree.body.data.room.type).to.eqls(type);
                        return [2 /*return*/];
                }
            });
        }); });
        it("saves room to db", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, room;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/rooms")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(validParams)];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("room");
                        return [4 /*yield*/, global_1.default.prisma.room.findFirst({
                                where: { id: response.body.data.room.id },
                                include: { users: true },
                            })];
                    case 2:
                        room = _a.sent();
                        (0, chai_1.expect)(JSON.stringify(response.body.data.room)).to.eqls(JSON.stringify(room));
                        return [2 /*return*/];
                }
            });
        }); });
        it("Two users can't have more than one private room", function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.default)()];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, (0, room_1.default)([
                                { userId: global_1.default.userId, isAdmin: true },
                                { userId: user.id, isAdmin: false },
                            ], { type: "private" })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms")
                                .set({ accesstoken: global_1.default.userToken })
                                .send({ userIds: [user.id] })];
                    case 3:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(409);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("/api/messenger/rooms/:id PUT", function () {
        it("returns 404 if there is no record with that id", function () { return __awaiter(void 0, void 0, void 0, function () {
            var id, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = 8851534158;
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .put("/api/messenger/rooms/" + id)
                                .set({ accesstoken: global_1.default.userToken })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(404);
                        return [2 /*return*/];
                }
            });
        }); });
        it("returns 403 if user is not an admin", function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, room, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.default)()];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, (0, room_1.default)([{ userId: user.id, isAdmin: true }])];
                    case 2:
                        room = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .put("/api/messenger/rooms/" + room.id)
                                .set({ accesstoken: global_1.default.userToken })];
                    case 3:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(403);
                        return [2 /*return*/];
                }
            });
        }); });
        it("adds users to user list", function () { return __awaiter(void 0, void 0, void 0, function () {
            var users, userIds, room, response, roomFromRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.createManyFakeUsers)(3)];
                    case 1:
                        users = _a.sent();
                        userIds = users.map(function (u) { return u.id; });
                        return [4 /*yield*/, (0, room_1.default)([{ userId: global_1.default.userId, isAdmin: true }])];
                    case 2:
                        room = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .put("/api/messenger/rooms/" + room.id)
                                .set({ accesstoken: global_1.default.userToken })
                                .send({ userIds: userIds })];
                    case 3:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("room");
                        roomFromRes = response.body.data.room;
                        (0, chai_1.expect)(roomFromRes.users).to.be.an("array");
                        (0, chai_1.expect)(roomFromRes.users.filter(function (u) { return !u.isAdmin; }).map(function (u) { return u.userId; })).to.include.members(userIds);
                        return [2 /*return*/];
                }
            });
        }); });
        it("removes users from user list", function () { return __awaiter(void 0, void 0, void 0, function () {
            var users, userIds, room, response, roomFromRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.createManyFakeUsers)(3)];
                    case 1:
                        users = _a.sent();
                        userIds = users.map(function (u) { return u.id; });
                        return [4 /*yield*/, (0, room_1.default)(__spreadArray([
                                { userId: global_1.default.userId, isAdmin: true }
                            ], userIds.map(function (userId) { return ({ userId: userId, isAdmin: false }); }), true))];
                    case 2:
                        room = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .put("/api/messenger/rooms/" + room.id)
                                .set({ accesstoken: global_1.default.userToken })
                                .send({ userIds: [] })];
                    case 3:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("room");
                        roomFromRes = response.body.data.room;
                        (0, chai_1.expect)(roomFromRes.users).to.be.an("array");
                        (0, chai_1.expect)(roomFromRes.users.filter(function (u) { return !u.isAdmin; }).map(function (u) { return u.userId; })).to.have.length(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it("adds users to admin list", function () { return __awaiter(void 0, void 0, void 0, function () {
            var users, adminUserIds, room, response, roomFromRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.createManyFakeUsers)(3)];
                    case 1:
                        users = _a.sent();
                        adminUserIds = users.map(function (u) { return u.id; });
                        return [4 /*yield*/, (0, room_1.default)([{ userId: global_1.default.userId, isAdmin: true }])];
                    case 2:
                        room = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .put("/api/messenger/rooms/" + room.id)
                                .set({ accesstoken: global_1.default.userToken })
                                .send({ adminUserIds: adminUserIds })];
                    case 3:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("room");
                        roomFromRes = response.body.data.room;
                        (0, chai_1.expect)(roomFromRes.users).to.be.an("array");
                        (0, chai_1.expect)(roomFromRes.users.filter(function (u) { return u.isAdmin; }).map(function (u) { return u.userId; })).to.include.members(__spreadArray([global_1.default.userId], adminUserIds, true));
                        return [2 /*return*/];
                }
            });
        }); });
        it("change type to 'group' if the number of users of the room changes from 2 to 3", function () { return __awaiter(void 0, void 0, void 0, function () {
            var users, userIds, room, response, roomFromRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.createManyFakeUsers)(2)];
                    case 1:
                        users = _a.sent();
                        userIds = users.map(function (u) { return u.id; });
                        return [4 /*yield*/, (0, room_1.default)([
                                { userId: global_1.default.userId, isAdmin: true },
                                { userId: users[0].id },
                            ])];
                    case 2:
                        room = _a.sent();
                        (0, chai_1.expect)(room.type).not.to.eqls("group");
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .put("/api/messenger/rooms/" + room.id)
                                .set({ accesstoken: global_1.default.userToken })
                                .send({ userIds: userIds })];
                    case 3:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("room");
                        roomFromRes = response.body.data.room;
                        (0, chai_1.expect)(roomFromRes.users).to.be.an("array");
                        (0, chai_1.expect)(roomFromRes.users).to.have.length(3);
                        (0, chai_1.expect)(roomFromRes).to.has.property("type");
                        (0, chai_1.expect)(roomFromRes.type).to.eqls("group");
                        return [2 /*return*/];
                }
            });
        }); });
        it("updates name if defined", function () { return __awaiter(void 0, void 0, void 0, function () {
            var room, name, response, roomFromRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, room_1.default)([{ userId: global_1.default.userId, isAdmin: true }])];
                    case 1:
                        room = _a.sent();
                        name = "Kool kids room";
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .put("/api/messenger/rooms/" + room.id)
                                .set({ accesstoken: global_1.default.userToken })
                                .send({ name: name })];
                    case 2:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("room");
                        roomFromRes = response.body.data.room;
                        (0, chai_1.expect)(roomFromRes.name).to.eqls(name);
                        return [2 /*return*/];
                }
            });
        }); });
        it("updates avatarUrl if defined", function () { return __awaiter(void 0, void 0, void 0, function () {
            var room, avatarUrl, response, roomFromRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, room_1.default)([{ userId: global_1.default.userId, isAdmin: true }])];
                    case 1:
                        room = _a.sent();
                        avatarUrl = "/some/new/path";
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .put("/api/messenger/rooms/" + room.id)
                                .set({ accesstoken: global_1.default.userToken })
                                .send({ avatarUrl: avatarUrl })];
                    case 2:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("room");
                        roomFromRes = response.body.data.room;
                        (0, chai_1.expect)(roomFromRes.avatarUrl).to.eqls(avatarUrl);
                        return [2 /*return*/];
                }
            });
        }); });
        it("updates are saved in db", function () { return __awaiter(void 0, void 0, void 0, function () {
            var room, avatarUrl, name, users, userIds, admins, adminUserIds, response, roomFromDb;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, room_1.default)([{ userId: global_1.default.userId, isAdmin: true }])];
                    case 1:
                        room = _a.sent();
                        avatarUrl = "/some/new/path";
                        name = "Kool kids room";
                        return [4 /*yield*/, (0, user_1.createManyFakeUsers)(2)];
                    case 2:
                        users = _a.sent();
                        userIds = users.map(function (u) { return u.id; });
                        return [4 /*yield*/, (0, user_1.createManyFakeUsers)(2)];
                    case 3:
                        admins = _a.sent();
                        adminUserIds = admins.map(function (u) { return u.id; });
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .put("/api/messenger/rooms/" + room.id)
                                .set({ accesstoken: global_1.default.userToken })
                                .send({ avatarUrl: avatarUrl, name: name, userIds: userIds, adminUserIds: adminUserIds })];
                    case 4:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        return [4 /*yield*/, global_1.default.prisma.room.findUnique({
                                where: { id: room.id },
                                include: { users: true },
                            })];
                    case 5:
                        roomFromDb = _a.sent();
                        (0, chai_1.expect)(roomFromDb).to.has.property("avatarUrl");
                        (0, chai_1.expect)(roomFromDb.avatarUrl).to.eqls(avatarUrl);
                        (0, chai_1.expect)(roomFromDb).to.has.property("name");
                        (0, chai_1.expect)(roomFromDb.name).to.eqls(name);
                        (0, chai_1.expect)(roomFromDb).to.has.property("users");
                        (0, chai_1.expect)(roomFromDb.users).to.be.an("array");
                        (0, chai_1.expect)(roomFromDb.users.filter(function (u) { return u.isAdmin; }).map(function (u) { return u.userId; })).to.include.members(__spreadArray([global_1.default.userId], adminUserIds, true));
                        (0, chai_1.expect)(roomFromDb.users.filter(function (u) { return !u.isAdmin; }).map(function (u) { return u.userId; })).to.include.members(userIds);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("/api/messenger/rooms GET", function () {
        it("Gets list of users rooms", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, roomsFromRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .get("/api/messenger/rooms")
                            .set({ accesstoken: global_1.default.userToken })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("list");
                        roomsFromRes = response.body.data.list;
                        (0, chai_1.expect)(roomsFromRes).to.be.an("array");
                        (0, chai_1.expect)(roomsFromRes.every(function (r) { return r.users.map(function (u) { return u.userId; }).includes(global_1.default.userId); })).to.eqls(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("/api/messenger/rooms/:id GET", function () {
        it("Gets room details", function () { return __awaiter(void 0, void 0, void 0, function () {
            var room, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, room_1.default)([{ userId: global_1.default.userId, isAdmin: true }])];
                    case 1:
                        room = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .get("/api/messenger/rooms/" + room.id)
                                .set({ accesstoken: global_1.default.userToken })];
                    case 2:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("room");
                        (0, chai_1.expect)(response.body.data.room.id).to.eqls(room.id);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("/api/messenger/rooms/:id DELETE", function () {
        it("returns 404 if there is no record with that id", function () { return __awaiter(void 0, void 0, void 0, function () {
            var id, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = 865454588;
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .delete("/api/messenger/rooms/" + id)
                                .set({ accesstoken: global_1.default.userToken })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(404);
                        return [2 /*return*/];
                }
            });
        }); });
        it("returns 403 if user is not an admin", function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, room, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.default)()];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, (0, room_1.default)([{ userId: user.id, isAdmin: true }])];
                    case 2:
                        room = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .delete("/api/messenger/rooms/" + room.id)
                                .set({ accesstoken: global_1.default.userToken })];
                    case 3:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(403);
                        return [2 /*return*/];
                }
            });
        }); });
        it("flags room as deleted", function () { return __awaiter(void 0, void 0, void 0, function () {
            var room, response, roomFromRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, room_1.default)([{ userId: global_1.default.userId, isAdmin: true }])];
                    case 1:
                        room = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .delete("/api/messenger/rooms/" + room.id)
                                .set({ accesstoken: global_1.default.userToken })];
                    case 2:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("room");
                        roomFromRes = response.body.data.room;
                        (0, chai_1.expect)(roomFromRes.deleted).to.eqls(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it("deletion is saved in db", function () { return __awaiter(void 0, void 0, void 0, function () {
            var room, response, roomFromDb;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, room_1.default)([{ userId: global_1.default.userId, isAdmin: true }])];
                    case 1:
                        room = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .delete("/api/messenger/rooms/" + room.id)
                                .set({ accesstoken: global_1.default.userToken })];
                    case 2:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        return [4 /*yield*/, global_1.default.prisma.room.findUnique({ where: { id: room.id } })];
                    case 3:
                        roomFromDb = _a.sent();
                        (0, chai_1.expect)(roomFromDb).to.has.property("deleted");
                        (0, chai_1.expect)(roomFromDb.deleted).to.eqls(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("/api/messenger/rooms/:id/leave POST", function () {
        it("returns 404 if there is no record with that id", function () { return __awaiter(void 0, void 0, void 0, function () {
            var id, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = 865454588;
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms/" + id + "/leave")
                                .set({ accesstoken: global_1.default.userToken })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(404);
                        return [2 /*return*/];
                }
            });
        }); });
        it("returns 404 if user is not in that room", function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, room, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.default)()];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, (0, room_1.default)([{ userId: user.id, isAdmin: true }])];
                    case 2:
                        room = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms/" + room.id + "/leave")
                                .set({ accesstoken: global_1.default.userToken })];
                    case 3:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(404);
                        return [2 /*return*/];
                }
            });
        }); });
        it("user can leave room", function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, room, response, roomFromRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.default)()];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, (0, room_1.default)([
                                { userId: user.id, isAdmin: true },
                                { userId: global_1.default.userId },
                            ])];
                    case 2:
                        room = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms/" + room.id + "/leave")
                                .set({ accesstoken: global_1.default.userToken })];
                    case 3:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("room");
                        roomFromRes = response.body.data.room;
                        (0, chai_1.expect)(roomFromRes.users).to.be.an("array");
                        (0, chai_1.expect)(roomFromRes.users.map(function (u) { return u.userId; })).to.not.include(global_1.default.userId);
                        return [2 /*return*/];
                }
            });
        }); });
        it("not last admin can leave room", function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, room, response, roomFromRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.default)()];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, (0, room_1.default)([
                                { userId: user.id, isAdmin: true },
                                { userId: global_1.default.userId, isAdmin: true },
                            ])];
                    case 2:
                        room = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms/" + room.id + "/leave")
                                .set({ accesstoken: global_1.default.userToken })];
                    case 3:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("room");
                        roomFromRes = response.body.data.room;
                        (0, chai_1.expect)(roomFromRes.users).to.be.an("array");
                        (0, chai_1.expect)(roomFromRes.users.map(function (u) { return u.userId; })).to.not.include(global_1.default.userId);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Last admin can leave room", function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, room, response, roomFromRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.default)()];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, (0, room_1.default)([{ userId: global_1.default.userId, isAdmin: true }])];
                    case 2:
                        room = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms/" + room.id + "/leave")
                                .set({ accesstoken: global_1.default.userToken })
                                .send({ adminUserIds: [user.id] })];
                    case 3:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("room");
                        roomFromRes = response.body.data.room;
                        (0, chai_1.expect)(roomFromRes.users).to.be.an("array");
                        (0, chai_1.expect)(roomFromRes.users.map(function (u) { return u.userId; })).to.not.include(global_1.default.userId);
                        (0, chai_1.expect)(roomFromRes.users.map(function (u) { return u.userId; })).to.include(user.id);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Last admin have to send adminUserIds so he can leave room", function () { return __awaiter(void 0, void 0, void 0, function () {
            var room, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, room_1.default)([{ userId: global_1.default.userId, isAdmin: true }])];
                    case 1:
                        room = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/rooms/" + room.id + "/leave")
                                .set({ accesstoken: global_1.default.userToken })];
                    case 2:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(400);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=08_messenger_room.js.map