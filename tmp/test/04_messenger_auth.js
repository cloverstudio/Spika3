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
var utils_1 = __importDefault(require("../server/components/utils"));
var telephoneNumber = "+385" + faker_1.default.fake("{{datatype.number}}");
var telephoneNumberHashed = utils_1.default.sha256(telephoneNumber);
var deviceId = faker_1.default.random.alphaNumeric(6);
describe("API", function () {
    describe("/api/messenger/auth GET", function () {
        it("Get method doesn't work", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default).get("/api/messenger/auth")];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(405);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("/api/messenger/auth POST", function () {
        it("Telephone number is missing", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default).post("/api/messenger/auth").send({
                            telephoneNumber: null,
                            deviceId: deviceId,
                        })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(400);
                        return [2 /*return*/];
                }
            });
        }); });
        it("DeviceId is missing", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default).post("/api/messenger/auth").send({
                            telephoneNumber: telephoneNumber,
                            deviceId: null,
                        })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(400);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Hash is missing", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default).post("/api/messenger/auth").send({
                            telephoneNumber: telephoneNumber,
                            deviceId: deviceId,
                        })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(400);
                        return [2 /*return*/];
                }
            });
        }); });
        it("New user", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default).post("/api/messenger/auth").send({
                            telephoneNumber: telephoneNumber,
                            telephoneNumberHashed: telephoneNumberHashed,
                            deviceId: deviceId,
                        })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body.data.isNewUser).equals(true);
                        global_1.default.userId = response.body.data.user.id;
                        return [2 /*return*/];
                }
            });
        }); });
        it("Resend verification code", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default).post("/api/messenger/auth").send({
                            telephoneNumber: telephoneNumber,
                            telephoneNumberHashed: telephoneNumberHashed,
                            deviceId: deviceId,
                        })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body.data.isNewUser).equals(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Verify verification code", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default).post("/api/messenger/auth/verify").send({
                            code: "eureka",
                            deviceId: deviceId,
                        })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(200);
                        (0, chai_1.expect)(response.body.data.device).to.have.property("token");
                        global_1.default.userToken = response.body.data.device.token;
                        return [2 /*return*/];
                }
            });
        }); });
        it("Verify verification code fail", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default).post("/api/messenger/auth/verify").send({
                            code: "eureka22",
                            deviceId: deviceId,
                        })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(403);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Verify verification code wrong device id", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default).post("/api/messenger/auth/verify").send({
                            code: "eureka",
                            deviceId: "wrong",
                        })];
                    case 1:
                        response = _a.sent();
                        (0, chai_1.expect)(response.status).to.eqls(403);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=04_messenger_auth.js.map