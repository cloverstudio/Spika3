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
var chai_1 = require("chai");
var supertest_1 = __importDefault(require("supertest"));
var server_1 = __importDefault(require("../server"));
var user_1 = __importDefault(require("./fixtures/user"));
var global_1 = __importDefault(require("./global"));
describe("User API", function () {
    describe("/api/messenger/me GET", function () {
        it("Should return my user", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .get("/api/messenger/me")
                            .set({ accesstoken: global_1.default.userToken })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("user");
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("/api/messenger/me PUT", function () {
        it("Requires email to be unique", function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakeUser, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.default)()];
                    case 1:
                        fakeUser = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .put("/api/messenger/me/")
                                .send({
                                emailAddress: fakeUser.emailAddress,
                            })
                                .set({ accesstoken: global_1.default.userToken })];
                    case 2:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(400);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Requires telephoneNumber to be unique", function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakeUser, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.default)()];
                    case 1:
                        fakeUser = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .put("/api/messenger/me/")
                                .send({
                                telephoneNumber: fakeUser.telephoneNumber,
                            })
                                .set({ accesstoken: global_1.default.userToken })];
                    case 2:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(400);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Requires telephoneNumberHashed to be unique", function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakeUser, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.default)()];
                    case 1:
                        fakeUser = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .put("/api/messenger/me/")
                                .send({
                                telephoneNumberHashed: fakeUser.telephoneNumberHashed,
                            })
                                .set({ accesstoken: global_1.default.userToken })];
                    case 2:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(400);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Updates user", function () { return __awaiter(void 0, void 0, void 0, function () {
            var displayName, avatarUrl, response, userFromDb;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        displayName = "John";
                        avatarUrl = "/new/avatar/url";
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .put("/api/messenger/me/")
                                .send({
                                displayName: displayName,
                                avatarUrl: avatarUrl,
                            })
                                .set({ accesstoken: global_1.default.userToken })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("user");
                        (0, chai_1.expect)(response.body.data.user.displayName).to.eqls(displayName);
                        (0, chai_1.expect)(response.body.data.user.avatarUrl).to.eqls(avatarUrl);
                        return [4 /*yield*/, global_1.default.prisma.user.findUnique({
                                where: { id: global_1.default.userId },
                            })];
                    case 2:
                        userFromDb = _a.sent();
                        (0, chai_1.expect)(userFromDb.displayName).to.eqls(displayName);
                        (0, chai_1.expect)(userFromDb.avatarUrl).to.eqls(avatarUrl);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=11_messenger_user.js.map