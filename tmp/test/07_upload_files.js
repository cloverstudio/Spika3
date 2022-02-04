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
var global_1 = __importDefault(require("./global"));
var util_1 = __importDefault(require("util"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var utils_1 = __importDefault(require("../server/components/utils"));
var file_1 = __importDefault(require("./fixtures/file"));
var faker_1 = __importDefault(require("faker"));
var mocha_1 = require("mocha");
var readDir = util_1.default.promisify(fs_1.default.readdir);
var readFile = util_1.default.promisify(fs_1.default.readFile);
var getFileStat = util_1.default.promisify(fs_1.default.stat);
describe("API", function () {
    describe("/api/upload/files/:id GET", function () {
        it("return 404 if no file", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseInvalid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default).get("/api/upload/files/125875288")];
                    case 1:
                        responseInvalid = _a.sent();
                        (0, chai_1.expect)(responseInvalid.status).to.eqls(404);
                        return [2 /*return*/];
                }
            });
        }); });
        it("returns file", function () { return __awaiter(void 0, void 0, void 0, function () {
            var fileName, filePath, file, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fileName = "test.png";
                        filePath = path_1.default.join(__dirname, "fixtures/files/" + fileName);
                        return [4 /*yield*/, (0, file_1.default)({ path: filePath, fileName: fileName })];
                    case 1:
                        file = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default).get("/api/upload/files/" + file.id)];
                    case 2:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("/api/upload/files POST", function () {
        var validParams = {};
        (0, mocha_1.beforeEach)(function () {
            validParams = {
                chunk: "string",
                offset: 0,
                total: 100,
                size: 200,
                mimeType: "string",
                fileName: "string",
                type: "string",
                fileHash: "string",
                relationId: 8,
                clientId: String(faker_1.default.datatype.number({ min: 1, max: 100000 })),
            };
        });
        (0, mocha_1.after)(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, global_1.default.prisma.file.deleteMany()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("Requires chunk param to be string", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseInvalid, responseInvalidNotString, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/upload/files")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { chunk: undefined }))];
                    case 1:
                        responseInvalid = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { chunk: 42 }))];
                    case 2:
                        responseInvalidNotString = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { chunk: "string" }))];
                    case 3:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(responseInvalid.status).to.eqls(400);
                        (0, chai_1.expect)(responseInvalidNotString.status).to.eqls(400);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Requires offset param to be number", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseInvalid, responseInvalidNotNumber, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/upload/files")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { offset: undefined }))];
                    case 1:
                        responseInvalid = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { offset: "string" }))];
                    case 2:
                        responseInvalidNotNumber = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { offset: 0 }))];
                    case 3:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(responseInvalid.status).to.eqls(400);
                        (0, chai_1.expect)(responseInvalidNotNumber.status).to.eqls(400);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Requires offset param to be less than total", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseInvalid, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/upload/files")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { offset: 22, total: 10 }))];
                    case 1:
                        responseInvalid = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { offset: 42, total: 43 }))];
                    case 2:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(responseInvalid.status).to.eqls(400);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Requires total param to be number", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseInvalid, responseInvalidNotNumber, responseInvalidZero, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/upload/files")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { total: undefined }))];
                    case 1:
                        responseInvalid = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { total: "string" }))];
                    case 2:
                        responseInvalidNotNumber = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { total: 0 }))];
                    case 3:
                        responseInvalidZero = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { total: 42 }))];
                    case 4:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(responseInvalid.status).to.eqls(400);
                        (0, chai_1.expect)(responseInvalidNotNumber.status).to.eqls(400);
                        (0, chai_1.expect)(responseInvalidZero.status).to.eqls(400);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Requires size param to be positive number", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseInvalid, responseInvalidNotNumber, responseInvalidZero, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/upload/files")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { size: undefined }))];
                    case 1:
                        responseInvalid = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { size: "string" }))];
                    case 2:
                        responseInvalidNotNumber = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { size: 0 }))];
                    case 3:
                        responseInvalidZero = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { size: 42 }))];
                    case 4:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(responseInvalid.status).to.eqls(400);
                        (0, chai_1.expect)(responseInvalidNotNumber.status).to.eqls(400);
                        (0, chai_1.expect)(responseInvalidZero.status).to.eqls(400);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Requires type param to be string", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseInvalid, responseInvalidNotString, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/upload/files")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { type: undefined }))];
                    case 1:
                        responseInvalid = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { type: 42 }))];
                    case 2:
                        responseInvalidNotString = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { type: "string" }))];
                    case 3:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(responseInvalid.status).to.eqls(400);
                        (0, chai_1.expect)(responseInvalidNotString.status).to.eqls(400);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Requires clientId param to be string", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseInvalid, responseInvalidNotString, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/upload/files")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { clientId: undefined }))];
                    case 1:
                        responseInvalid = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { clientId: 42 }))];
                    case 2:
                        responseInvalidNotString = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { clientId: "string" }))];
                    case 3:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(responseInvalid.status).to.eqls(400);
                        (0, chai_1.expect)(responseInvalidNotString.status).to.eqls(400);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Requires clientId param to be unique", function () { return __awaiter(void 0, void 0, void 0, function () {
            var clientId, responseInvalid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clientId = faker_1.default.datatype.string(20);
                        return [4 /*yield*/, (0, file_1.default)({ clientId: clientId })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { clientId: clientId }))];
                    case 2:
                        responseInvalid = _a.sent();
                        (0, chai_1.expect)(responseInvalid.status).to.eqls(400);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Requires mimeType param to be string", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseInvalid, responseInvalidNotString, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/upload/files")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { mimeType: undefined }))];
                    case 1:
                        responseInvalid = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { mimeType: 42 }))];
                    case 2:
                        responseInvalidNotString = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { mimeType: "string" }))];
                    case 3:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(responseInvalid.status).to.eqls(400);
                        (0, chai_1.expect)(responseInvalidNotString.status).to.eqls(400);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("If defined, requires fileHash param to be string", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseNoParam, responseInvalidNotString, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/upload/files")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { fileHash: undefined }))];
                    case 1:
                        responseNoParam = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { fileHash: 42 }))];
                    case 2:
                        responseInvalidNotString = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { fileHash: "string" }))];
                    case 3:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(responseInvalidNotString.status).to.eqls(400);
                        (0, chai_1.expect)(responseNoParam.status).to.eqls(200);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("If defined, requires relationId param to be number", function () { return __awaiter(void 0, void 0, void 0, function () {
            var responseNoParam, responseInvalidNotNumber, responseValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                            .post("/api/upload/files")
                            .set({ accesstoken: global_1.default.userToken })
                            .send(__assign(__assign({}, validParams), { relationId: undefined }))];
                    case 1:
                        responseNoParam = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { relationId: "42" }))];
                    case 2:
                        responseInvalidNotNumber = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { relationId: 5 }))];
                    case 3:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(responseInvalidNotNumber.status).to.eqls(400);
                        (0, chai_1.expect)(responseNoParam.status).to.eqls(200);
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Returns error if hash is not matching", function () { return __awaiter(void 0, void 0, void 0, function () {
            var fileName, filePath, fileHash, size, chunkSize, readable, total, offset, filesDir, files, fileFromDb;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fileName = "test.png";
                        filePath = path_1.default.join(__dirname, "fixtures/files/" + fileName);
                        fileHash = "wrong hash";
                        return [4 /*yield*/, getFileStat(filePath)];
                    case 1:
                        size = (_a.sent()).size;
                        chunkSize = 8;
                        readable = fs_1.default.createReadStream(filePath, { highWaterMark: chunkSize });
                        total = Math.ceil(size / chunkSize);
                        offset = -1;
                        readable.on("data", function (chunk) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            offset++;
                                            return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                                    .post("/api/upload/files")
                                                    .set({ accesstoken: global_1.default.userToken })
                                                    .send(__assign(__assign({}, validParams), { fileName: fileName, chunk: chunk.toString("base64"), offset: offset, total: total, size: size, fileHash: fileHash }))];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        });
                        return [4 /*yield*/, utils_1.default.wait(1)];
                    case 2:
                        _a.sent();
                        filesDir = path_1.default.join(process.env["UPLOAD_FOLDER"], "files");
                        return [4 /*yield*/, readDir(filesDir)];
                    case 3:
                        files = _a.sent();
                        (0, chai_1.expect)(files).to.be.an("array").that.does.not.include(validParams.clientId);
                        return [4 /*yield*/, global_1.default.prisma.file.findFirst({
                                where: { clientId: validParams.clientId },
                            })];
                    case 4:
                        fileFromDb = _a.sent();
                        (0, chai_1.expect)(fileFromDb).to.eqls(null);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Uploads chunk of file", function () { return __awaiter(void 0, void 0, void 0, function () {
            var fileName, chunk, offset, responseValid, tempFileDir, tempFileDirExists, files, content;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fileName = "test File";
                        chunk = Buffer.from("101").toString("base64");
                        offset = 0;
                        return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                .post("/api/upload/files")
                                .set({ accesstoken: global_1.default.userToken })
                                .send(__assign(__assign({}, validParams), { fileName: fileName, chunk: chunk, offset: offset, total: 2 }))];
                    case 1:
                        responseValid = _a.sent();
                        (0, chai_1.expect)(responseValid.status).to.eqls(200);
                        (0, chai_1.expect)(responseValid.body).to.has.property("data");
                        (0, chai_1.expect)(responseValid.body.data).to.has.property("uploadedChunks");
                        (0, chai_1.expect)(responseValid.body.data.uploadedChunks).to.be.an("array").that.does.include(0);
                        (0, chai_1.expect)(responseValid.body.data.uploadedChunks).to.have.lengthOf(1);
                        tempFileDir = path_1.default.join(process.env["UPLOAD_FOLDER"], ".temp/" + validParams.clientId);
                        tempFileDirExists = fs_1.default.existsSync(tempFileDir);
                        (0, chai_1.expect)(tempFileDirExists).to.eqls(true);
                        return [4 /*yield*/, readDir(tempFileDir)];
                    case 2:
                        files = _a.sent();
                        (0, chai_1.expect)(files).to.be.an("array").that.does.include(offset + "-chunk");
                        return [4 /*yield*/, readFile(tempFileDir + ("/" + offset + "-chunk"))];
                    case 3:
                        content = _a.sent();
                        (0, chai_1.expect)(content.toString()).to.eqls("101");
                        return [2 /*return*/];
                }
            });
        }); });
        it("Uploads file", function () { return __awaiter(void 0, void 0, void 0, function () {
            var fileName, filePath, size, chunkSize, readable, total, offset, filesDir, filesDirExists, files, originalFile, content, createdFile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fileName = "test.png";
                        filePath = path_1.default.join(__dirname, "fixtures/files/" + fileName);
                        return [4 /*yield*/, getFileStat(filePath)];
                    case 1:
                        size = (_a.sent()).size;
                        chunkSize = 8;
                        readable = fs_1.default.createReadStream(filePath, { highWaterMark: chunkSize });
                        total = Math.ceil(size / chunkSize);
                        offset = -1;
                        readable.on("data", function (chunk) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            offset++;
                                            return [4 /*yield*/, (0, supertest_1.default)(server_1.default)
                                                    .post("/api/upload/files")
                                                    .set({ accesstoken: global_1.default.userToken })
                                                    .send(__assign(__assign({}, validParams), { fileName: fileName, chunk: chunk.toString("base64"), offset: offset, total: total, size: size, fileHash: undefined }))];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        });
                        return [4 /*yield*/, utils_1.default.wait(1)];
                    case 2:
                        _a.sent();
                        filesDir = path_1.default.join(process.env["UPLOAD_FOLDER"], "files");
                        filesDirExists = fs_1.default.existsSync(filesDir);
                        (0, chai_1.expect)(filesDirExists).to.eqls(true);
                        return [4 /*yield*/, readDir(filesDir)];
                    case 3:
                        files = _a.sent();
                        (0, chai_1.expect)(files).to.be.an("array").that.does.include(validParams.clientId);
                        return [4 /*yield*/, readFile(filePath)];
                    case 4:
                        originalFile = _a.sent();
                        return [4 /*yield*/, readFile(filesDir + ("/" + validParams.clientId))];
                    case 5:
                        content = _a.sent();
                        (0, chai_1.expect)(content.toString()).to.eqls(originalFile.toString());
                        return [4 /*yield*/, global_1.default.prisma.file.findFirst({
                                where: { clientId: validParams.clientId },
                            })];
                    case 6:
                        createdFile = _a.sent();
                        (0, chai_1.expect)(createdFile.fileName).to.eqls(fileName);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=07_upload_files.js.map