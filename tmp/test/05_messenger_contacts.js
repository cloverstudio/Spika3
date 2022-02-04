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
var user_1 = __importStar(require("./fixtures/user"));
var Constants = __importStar(require("../server/components/consts"));
var contact_1 = __importDefault(require("./fixtures/contact"));
var utils_1 = __importDefault(require("../server/components/utils"));
describe("API", function () {
    var users = [];
    before(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _b = (_a = users.push).apply;
                    _c = [users];
                    return [4 /*yield*/, (0, user_1.createManyFakeUsers)(10)];
                case 1:
                    _b.apply(_a, _c.concat([(_d.sent())]));
                    return [2 /*return*/];
            }
        });
    }); });
    describe("/api/messenger/contacts GET", function () {
        it("Works without any params", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .get("/api/messenger/contacts")
                            .set({ accesstoken: global_1.default.userToken })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("list");
                        (0, chai_1.expect)(response.body.data).to.has.property("count");
                        (0, chai_1.expect)(response.body.data).to.has.property("limit");
                        (0, chai_1.expect)(response.body.data.limit).to.eqls(Constants.PAGING_LIMIT);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Accepts page query", function () { return __awaiter(void 0, void 0, void 0, function () {
            var contacts, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, contact_1.default)({
                            userId: global_1.default.userId,
                            contacts: users,
                        })];
                    case 1:
                        contacts = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .get("/api/messenger/contacts?page=2")
                                .set({ accesstoken: global_1.default.userToken })];
                    case 2:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("list");
                        (0, chai_1.expect)(response.body.data).to.has.property("count");
                        (0, chai_1.expect)(response.body.data).to.has.property("limit");
                        (0, chai_1.expect)(response.body.data.limit).to.eqls(Constants.PAGING_LIMIT);
                        (0, chai_1.expect)(response.body.data.count).to.eqls(contacts.count);
                        (0, chai_1.expect)(response.body.data.list.length === 0).to.eqls(contacts.count > Constants.PAGING_LIMIT ? false : true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("/api/messenger/contacts POST", function () {
        it("Contacts param must be string or array of strings", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseContactsUndefined, responseContactsBool, responseContactsNum, responseContactsArrayOfNum, responseContactsArrayOfStrings, responseContactsString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/contacts")
                            .set({ accesstoken: global_1.default.userToken })];
                    case 1:
                        responseContactsUndefined = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/contacts")
                                .set({ accesstoken: global_1.default.userToken })
                                .send({ contacts: true })];
                    case 2:
                        responseContactsBool = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/contacts")
                                .set({ accesstoken: global_1.default.userToken })
                                .send({ contacts: 42 })];
                    case 3:
                        responseContactsNum = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/contacts")
                                .set({ accesstoken: global_1.default.userToken })
                                .send({ contacts: [42] })];
                    case 4:
                        responseContactsArrayOfNum = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/contacts")
                                .set({ accesstoken: global_1.default.userToken })
                                .send({ contacts: ["42"] })];
                    case 5:
                        responseContactsArrayOfStrings = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/contacts")
                                .set({ accesstoken: global_1.default.userToken })
                                .send({ contacts: "42" })];
                    case 6:
                        responseContactsString = _a.sent();
                        (0, chai_1.expect)(responseContactsUndefined.status).to.eqls(400);
                        (0, chai_1.expect)(responseContactsBool.status).to.eqls(400);
                        (0, chai_1.expect)(responseContactsNum.status).to.eqls(400);
                        (0, chai_1.expect)(responseContactsArrayOfNum.status).to.eqls(400);
                        (0, chai_1.expect)(responseContactsArrayOfStrings.status).to.eqls(200);
                        (0, chai_1.expect)(responseContactsString.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Contacts param must have at least one hash", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseContactsInvalidLength, responseContactsValidLengthString, responseContactsValidLengthArray;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/contacts")
                            .set({ accesstoken: global_1.default.userToken })
                            .send({ contacts: [] })];
                    case 1:
                        responseContactsInvalidLength = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/contacts")
                                .set({ accesstoken: global_1.default.userToken })
                                .send({ contacts: "42" })];
                    case 2:
                        responseContactsValidLengthString = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/contacts")
                                .set({ accesstoken: global_1.default.userToken })
                                .send({ contacts: ["42"] })];
                    case 3:
                        responseContactsValidLengthArray = _a.sent();
                        (0, chai_1.expect)(responseContactsInvalidLength.status).to.eqls(400);
                        (0, chai_1.expect)(responseContactsValidLengthString.status).to.eqls(200);
                        (0, chai_1.expect)(responseContactsValidLengthArray.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Contacts param must respect max length", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseContactsInvalidLength, responseContactsValidLength;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/messenger/contacts")
                            .set({ accesstoken: global_1.default.userToken })
                            .send({
                            contacts: Array(Constants.CONTACT_SYNC_LIMIT + 1)
                                .fill("hash")
                                .map(function (h) { return h; }),
                        })];
                    case 1:
                        responseContactsInvalidLength = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/contacts")
                                .set({ accesstoken: global_1.default.userToken })
                                .send({
                                contacts: Array(Constants.CONTACT_SYNC_LIMIT)
                                    .fill("hash")
                                    .map(function (h) { return h; }),
                            })];
                    case 2:
                        responseContactsValidLength = _a.sent();
                        (0, chai_1.expect)(responseContactsInvalidLength.status).to.eqls(400);
                        (0, chai_1.expect)(responseContactsValidLength.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Returns a list of existing verified users", function () { return __awaiter(void 0, void 0, void 0, function () {
            var nonVerifiedUser, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.default)({ verified: false })];
                    case 1:
                        nonVerifiedUser = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/messenger/contacts")
                                .set({ accesstoken: global_1.default.userToken })
                                .send({
                                contacts: __spreadArray(__spreadArray([], users.map(function (u) { return u.telephoneNumberHashed; }), true), [
                                    "fakeHash",
                                    nonVerifiedUser.telephoneNumberHashed,
                                ], false),
                            })];
                    case 2:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body).to.has.property("data");
                        (0, chai_1.expect)(response.body.data).to.has.property("list");
                        (0, chai_1.expect)(response.body.data).to.has.property("count");
                        (0, chai_1.expect)(response.body.data).to.has.property("limit");
                        (0, chai_1.expect)(response.body.data.limit).to.eqls(Constants.CONTACT_SYNC_LIMIT);
                        (0, chai_1.expect)(response.body.data.count).to.eqls(users.length);
                        (0, chai_1.expect)(response.body.data.list.length).to.eqls(users.length);
                        (0, chai_1.expect)(response.body.data.list.some(function (u) { return u.verified === false; })).to.eqls(false);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Create contact record for every existing verified users", function () { return __awaiter(void 0, void 0, void 0, function () {
            var contacts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // not sure about how to wait for rabbitMq workers to finish adding contacts
                    // this bellow seems to be working but not sure if it is the best way
                    return [4 /*yield*/, utils_1.default.wait(0.5)];
                    case 1:
                        // not sure about how to wait for rabbitMq workers to finish adding contacts
                        // this bellow seems to be working but not sure if it is the best way
                        _a.sent();
                        return [4 /*yield*/, global_1.default.prisma.contact.findMany({
                                where: { userId: global_1.default.userId },
                            })];
                    case 2:
                        contacts = _a.sent();
                        (0, chai_1.expect)(users.every(function (u) { return contacts.map(function (c) { return c.contactId; }).includes(u.id); })).to.eqls(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=05_messenger_contacts.js.map