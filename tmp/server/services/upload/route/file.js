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
var util_1 = __importDefault(require("util"));
var fs_1 = __importDefault(require("fs"));
var crypto_1 = __importDefault(require("crypto"));
var path_1 = __importDefault(require("path"));
var response_1 = require("../../../components/response");
var mkdir = util_1.default.promisify(fs_1.default.mkdir);
var readDir = util_1.default.promisify(fs_1.default.readdir);
var removeDir = util_1.default.promisify(fs_1.default.rmdir);
var writeFile = util_1.default.promisify(fs_1.default.writeFile);
var readFile = util_1.default.promisify(fs_1.default.readFile);
var removeFile = util_1.default.promisify(fs_1.default.unlink);
var prisma = new client_1.PrismaClient();
var logger_1 = require("../../../components/logger");
var yup = __importStar(require("yup"));
var validateMiddleware_1 = __importDefault(require("../../../components/validateMiddleware"));
var postFilesSchema = yup.object().shape({
    body: yup.object().shape({
        chunk: yup.string().strict().required(),
        offset: yup.number().strict().min(0).lessThan(yup.ref("total")).required(),
        total: yup.number().strict().min(1).required(),
        mimeType: yup.string().strict().required(),
        fileName: yup.string().strict().required(),
        clientId: yup.string().strict().required(),
        type: yup.string().strict().required(),
        size: yup.number().strict().min(1).required(),
        fileHash: yup.string().strict(),
        relationId: yup.number().strict(),
    }),
});
exports.default = (function () {
    var router = (0, express_1.Router)();
    router.post("/", (0, validateMiddleware_1.default)(postFilesSchema), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, _a, chunk, offset, total, size, mimeType, fileName, fileHash, type, relationId, clientId, exists, tempFileDir, files, allChunks, uploadedChunks_1, allChunksUploaded, filesDir, filePath, writeStream, _i, allChunks_1, chunkIndex, content, hashMatches, file, _b, _c, fileName_1, error_1, e_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    userReq = req;
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 28, , 29]);
                    _a = req.body, chunk = _a.chunk, offset = _a.offset, total = _a.total, size = _a.size, mimeType = _a.mimeType, fileName = _a.fileName, fileHash = _a.fileHash, type = _a.type, relationId = _a.relationId, clientId = _a.clientId;
                    return [4 /*yield*/, prisma.file.findFirst({ where: { clientId: clientId } })];
                case 2:
                    exists = _d.sent();
                    if (exists) {
                        return [2 /*return*/, res
                                .status(400)
                                .send((0, response_1.errorResponse)("File with that clientId already exists", userReq.lang))];
                    }
                    tempFileDir = path_1.default.join(process.env["UPLOAD_FOLDER"], ".temp/" + clientId);
                    if (!!fs_1.default.existsSync(tempFileDir)) return [3 /*break*/, 4];
                    return [4 /*yield*/, mkdir(tempFileDir, { recursive: true })];
                case 3:
                    _d.sent();
                    _d.label = 4;
                case 4: return [4 /*yield*/, writeFile(tempFileDir + ("/" + offset + "-chunk"), Buffer.from(chunk, "base64"))];
                case 5:
                    _d.sent();
                    return [4 /*yield*/, readDir(tempFileDir)];
                case 6:
                    files = _d.sent();
                    allChunks = Array(total)
                        .fill(true)
                        .map(function (_, i) { return i; });
                    uploadedChunks_1 = files.map(function (f) { return +f.split("-")[0]; });
                    allChunksUploaded = allChunks.every(function (c) { return uploadedChunks_1.includes(c); });
                    if (!allChunksUploaded) {
                        return [2 /*return*/, res.send({
                                data: {
                                    uploadedChunks: uploadedChunks_1,
                                },
                            })];
                    }
                    filesDir = path_1.default.join(process.env["UPLOAD_FOLDER"], "files");
                    if (!!fs_1.default.existsSync(filesDir)) return [3 /*break*/, 8];
                    return [4 /*yield*/, mkdir(filesDir)];
                case 7:
                    _d.sent();
                    _d.label = 8;
                case 8:
                    filePath = path_1.default.join(filesDir, clientId);
                    if (fs_1.default.existsSync(filePath)) {
                        // this means that some other chunk started to create file
                        // not sure what to return here as file is not saved yet in db, try log line bellow
                        // const file = await prisma.file.findFirst({ where: { clientId } });
                        return [2 /*return*/, res.send({
                                data: {
                                    uploadedChunks: uploadedChunks_1,
                                },
                            })];
                    }
                    return [4 /*yield*/, writeFile(filePath, "")];
                case 9:
                    _d.sent();
                    writeStream = fs_1.default.createWriteStream(filePath);
                    _i = 0, allChunks_1 = allChunks;
                    _d.label = 10;
                case 10:
                    if (!(_i < allChunks_1.length)) return [3 /*break*/, 13];
                    chunkIndex = allChunks_1[_i];
                    return [4 /*yield*/, readFile(tempFileDir + ("/" + chunkIndex + "-chunk"))];
                case 11:
                    content = _d.sent();
                    writeStream.write(content);
                    _d.label = 12;
                case 12:
                    _i++;
                    return [3 /*break*/, 10];
                case 13:
                    writeStream.end();
                    return [4 /*yield*/, checkHashes(fileHash, filePath)];
                case 14:
                    hashMatches = _d.sent();
                    if (!!hashMatches) return [3 /*break*/, 16];
                    return [4 /*yield*/, removeFile(filePath)];
                case 15:
                    _d.sent();
                    return [2 /*return*/, res.status(400).send((0, response_1.errorResponse)("Hash doesn't match", userReq.lang))];
                case 16: return [4 /*yield*/, prisma.file.create({
                        data: {
                            fileName: fileName,
                            size: size,
                            mimeType: mimeType,
                            type: type,
                            relationId: relationId,
                            clientId: clientId,
                            path: filePath,
                        },
                    })];
                case 17:
                    file = _d.sent();
                    res.send((0, response_1.successResponse)({ uploadedChunks: uploadedChunks_1, file: file }, userReq.lang));
                    _d.label = 18;
                case 18:
                    _d.trys.push([18, 26, , 27]);
                    _b = 0;
                    return [4 /*yield*/, readDir(tempFileDir)];
                case 19:
                    _c = _d.sent();
                    _d.label = 20;
                case 20:
                    if (!(_b < _c.length)) return [3 /*break*/, 23];
                    fileName_1 = _c[_b];
                    if (!fs_1.default.existsSync(path_1.default.join(tempFileDir, fileName_1))) return [3 /*break*/, 22];
                    return [4 /*yield*/, removeFile(path_1.default.join(tempFileDir, fileName_1))];
                case 21:
                    _d.sent();
                    _d.label = 22;
                case 22:
                    _b++;
                    return [3 /*break*/, 20];
                case 23:
                    if (!fs_1.default.existsSync(tempFileDir)) return [3 /*break*/, 25];
                    return [4 /*yield*/, removeDir(tempFileDir)];
                case 24:
                    _d.sent();
                    _d.label = 25;
                case 25: return [3 /*break*/, 27];
                case 26:
                    error_1 = _d.sent();
                    return [3 /*break*/, 27];
                case 27: return [3 /*break*/, 29];
                case 28:
                    e_1 = _d.sent();
                    (0, logger_1.error)(e_1);
                    res.status(500).send((0, response_1.errorResponse)("Server error " + e_1, userReq.lang));
                    return [3 /*break*/, 29];
                case 29: return [2 /*return*/];
            }
        });
    }); });
    router.get("/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, id, file, readable, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userReq = req;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    id = parseInt(req.params.id || "");
                    return [4 /*yield*/, prisma.file.findFirst({ where: { id: id } })];
                case 2:
                    file = _a.sent();
                    if (!file) {
                        return [2 /*return*/, res.status(404).send((0, response_1.errorResponse)("Not found", userReq.lang))];
                    }
                    if (!fs_1.default.existsSync(file.path)) {
                        return [2 /*return*/, res.status(404).send((0, response_1.errorResponse)("Not found", userReq.lang))];
                    }
                    readable = fs_1.default.createReadStream(file.path);
                    readable.pipe(res);
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    (0, logger_1.error)(e_2);
                    res.status(500).send((0, response_1.errorResponse)("Server error " + e_2, userReq.lang));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    router.get("/check/:fileName", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, fileName, dirPath, files, uploadedChunks, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userReq = req;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    fileName = req.params.fileName;
                    dirPath = path_1.default.join(__dirname, "../uploads/.temp/" + fileName);
                    if (!fs_1.default.existsSync(dirPath)) {
                        return [2 /*return*/, res.status(404).send((0, response_1.errorResponse)("Not found", userReq.lang))];
                    }
                    return [4 /*yield*/, readDir(dirPath)];
                case 2:
                    files = _a.sent();
                    uploadedChunks = files.map(function (chunkName) { return +chunkName.split("-")[0]; });
                    res.send((0, response_1.successResponse)({ uploadedChunks: uploadedChunks }, userReq.lang));
                    return [3 /*break*/, 4];
                case 3:
                    e_3 = _a.sent();
                    (0, logger_1.error)(e_3);
                    res.status(500).send((0, response_1.errorResponse)("Server error " + e_3, userReq.lang));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    return router;
});
function checkHashes(hashed, filePath) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    try {
                        if (!hashed) {
                            return resolve(true);
                        }
                        var readable = fs_1.default.createReadStream(filePath);
                        var hash_1 = crypto_1.default.createHash("sha256");
                        hash_1.setEncoding("hex");
                        readable.on("end", function () {
                            hash_1.end();
                            var result = hash_1.read().toString("hex");
                            if (!result) {
                                console.log({ hashedFailed: hashed });
                                return resolve(false);
                            }
                            return resolve(result == hashed);
                        });
                        readable.on("error", function (error) {
                            hash_1.end();
                            return reject(error);
                        });
                        readable.pipe(hash_1);
                    }
                    catch (error) {
                        console.log({ error: error });
                        reject(error);
                    }
                })];
        });
    });
}
//# sourceMappingURL=file.js.map