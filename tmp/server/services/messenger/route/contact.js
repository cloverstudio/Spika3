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
var logger_1 = require("../../../components/logger");
var Constants = __importStar(require("../../../components/consts"));
var auth_1 = __importDefault(require("../lib/auth"));
var yup = __importStar(require("yup"));
var validateMiddleware_1 = __importDefault(require("../../../components/validateMiddleware"));
var response_1 = require("../../../components/response");
var sanitize_1 = __importDefault(require("../../../components/sanitize"));
var prisma = new client_1.PrismaClient();
var postContactsSchema = yup.object().shape({
    body: yup.object().shape({
        contacts: yup.lazy(function (value) {
            return typeof value === "string"
                ? yup.string().transform(function (value) {
                    return value
                        .split(",")
                        .map(function (v) { return v.trim(); })
                        .filter(function (v) { return v; });
                })
                : yup
                    .array(yup.string())
                    .strict()
                    .min(1)
                    .max(Constants.CONTACT_SYNC_LIMIT)
                    .required()
                    .typeError(function (_a) {
                    var path = _a.path, originalValue = _a.originalValue;
                    return path + " must be array or string, currently: " + originalValue;
                });
        }),
    }),
});
var getContactsSchema = yup.object().shape({
    query: yup.object().shape({
        page: yup.number().default(1),
    }),
});
exports.default = (function (_a) {
    var rabbitMQChannel = _a.rabbitMQChannel;
    var router = (0, express_1.Router)();
    router.get("/", auth_1.default, (0, validateMiddleware_1.default)(getContactsSchema), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, page, contacts, count, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userReq = req;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    page = parseInt(req.query.page ? req.query.page : "") || 1;
                    return [4 /*yield*/, prisma.contact.findMany({
                            where: {
                                user: userReq.user,
                            },
                            include: {
                                contact: true,
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
                    contacts = _a.sent();
                    return [4 /*yield*/, prisma.contact.count({
                            where: {
                                user: userReq.user,
                            },
                        })];
                case 3:
                    count = _a.sent();
                    res.send((0, response_1.successResponse)({
                        list: contacts.map(function (c) { return c.contact; }),
                        count: count,
                        limit: Constants.PAGING_LIMIT,
                    }, userReq.lang));
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    (0, logger_1.error)(e_1);
                    res.status(500).send((0, response_1.errorResponse)("Server error " + e_1, userReq.lang));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    router.post("/", auth_1.default, (0, validateMiddleware_1.default)(postContactsSchema), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, hashList, verifiedUsers, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userReq = req;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    hashList = req.body.contacts;
                    return [4 /*yield*/, prisma.user.findMany({
                            where: {
                                telephoneNumberHashed: { in: hashList },
                                verified: true,
                            },
                        })];
                case 2:
                    verifiedUsers = _a.sent();
                    verifiedUsers.forEach(function (contact) {
                        var payload = { userId: userReq.user.id, contactId: contact.id };
                        rabbitMQChannel.sendToQueue(Constants.QUEUE_CREATE_CONTACT, Buffer.from(JSON.stringify(payload)));
                    });
                    res.send((0, response_1.successResponse)({
                        list: verifiedUsers.map(function (user) { return (0, sanitize_1.default)(user).user(); }),
                        count: verifiedUsers.length,
                        limit: Constants.CONTACT_SYNC_LIMIT,
                    }, userReq.lang));
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
    return router;
});
//# sourceMappingURL=contact.js.map