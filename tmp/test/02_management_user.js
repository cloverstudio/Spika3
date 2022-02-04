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
var faker_1 = __importDefault(require("faker"));
var global_1 = __importDefault(require("./global"));
describe("Admin user management API", function () {
    describe("/api/management/user POST", function () {
        it("Should work", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/management/user")
                            .send({
                            displayName: faker_1.default.name.firstName(),
                            emailAddress: faker_1.default.internet.email(),
                            telephoneNumber: faker_1.default.phone.phoneNumber(),
                        })
                            .set({ "admin-accesstoken": global_1.default.adminToken })];
                    case 1:
                        response = _a.sent();
                        global_1.default.createdUser = response.body.data.user;
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Return 403 error", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/management/user")
                            .set({ "admin-accesstoken": "wrongtoken" })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(403);
                        return [2 /*return*/];
                }
            });
        }); });
        it("wrong login name", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/management/user")
                            .send({
                            displayName: null,
                        })
                            .set({ "admin-accesstoken": global_1.default.adminToken })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(400);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("/api/management/user/:userId PUT", function () {
        it("Should work", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .put("/api/management/user/" + global_1.default.createdUser.id)
                            .send({
                            displayName: faker_1.default.name.firstName(),
                            emailAddress: faker_1.default.internet.email(),
                            telephoneNumber: faker_1.default.phone.phoneNumber(),
                        })
                            .set({ "admin-accesstoken": global_1.default.adminToken })];
                    case 1:
                        response = _a.sent();
                        global_1.default.createdUser = response.body.data.user;
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Return 403 error", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .put("/api/management/user/" + global_1.default.createdUser.id)
                            .set({ "admin-accesstoken": "wrongtoken" })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(403);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Should change only email", function () { return __awaiter(void 0, void 0, void 0, function () {
            var newEmail, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newEmail = faker_1.default.internet.email();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .put("/api/management/user/" + global_1.default.createdUser.id)
                                .send({
                                displayName: faker_1.default.name.firstName(),
                                emailAddress: newEmail,
                                telephoneNumber: faker_1.default.phone.phoneNumber(),
                            })
                                .set({ "admin-accesstoken": global_1.default.adminToken })];
                    case 1:
                        response = _a.sent();
                        global_1.default.createdUser = response.body.data.user;
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("/api/management/user/:id GET", function () {
        it("Should work", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .get("/api/management/user/" + global_1.default.createdUser.id)
                            .set({ "admin-accesstoken": global_1.default.adminToken })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("/api/management/user GET", function () {
        it("Should work", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .get("/api/management/user")
                            .set({ "admin-accesstoken": global_1.default.adminToken })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body.data).to.be.an("object");
                        (0, chai_1.expect)(response.body.data.list).to.be.an("array");
                        (0, chai_1.expect)(response.body.data.count).to.be.an("number");
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("/api/management/user?page GET", function () {
        it("Should work", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .get("/api/management/user?page=1")
                            .set({ "admin-accesstoken": global_1.default.adminToken })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.be.an("object");
                        (0, chai_1.expect)(response.body.data.list).to.be.an("array");
                        (0, chai_1.expect)(response.body.data.count).to.be.an("number");
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("/api/management/user/:id DELETE", function () {
        it("Should work", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .delete("/api/management/user/" + global_1.default.createdUser.id)
                            .set({ "admin-accesstoken": global_1.default.adminToken })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=02_management_user.js.map