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
var validateMiddleware_1 = __importDefault(require("../../../components/validateMiddleware"));
var yup = __importStar(require("yup"));
var response_1 = require("../../../components/response");
var auth_1 = __importDefault(require("../lib/auth"));
var sanitize_1 = __importDefault(require("../../../components/sanitize"));
var prisma = new client_1.PrismaClient();
var updateSchema = yup.object().shape({
    body: yup.object().shape({
        telephoneNumber: yup.string().strict(),
        telephoneNumberHashed: yup.string().strict(),
        emailAddress: yup.string().strict(),
        displayName: yup.string().strict(),
        avatarUrl: yup.string().strict(),
    }),
});
exports.default = (function () {
    var router = (0, express_1.Router)();
    router.get("/", auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq;
        return __generator(this, function (_a) {
            userReq = req;
            try {
                res.send((0, response_1.successResponse)({ user: (0, sanitize_1.default)(userReq.user).user() }));
            }
            catch (e) {
                (0, logger_1.error)(e);
                res.status(500).send((0, response_1.errorResponse)("Server error " + e, userReq.lang));
            }
            return [2 /*return*/];
        });
    }); });
    router.put("/", auth_1.default, (0, validateMiddleware_1.default)(updateSchema), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userReq, id, _a, telephoneNumber, telephoneNumberHashed, emailAddress, displayName, avatarUrl, userWithSameEmailAddress, _b, userWithSameTelephoneNumber, _c, userWithSameTelephoneNumberHashed, _d, user, e_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    userReq = req;
                    id = userReq.user.id;
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 9, , 10]);
                    _a = req.body, telephoneNumber = _a.telephoneNumber, telephoneNumberHashed = _a.telephoneNumberHashed, emailAddress = _a.emailAddress, displayName = _a.displayName, avatarUrl = _a.avatarUrl;
                    _b = emailAddress;
                    if (!_b) return [3 /*break*/, 3];
                    return [4 /*yield*/, prisma.user.findFirst({
                            where: { emailAddress: emailAddress, id: { not: id } },
                        })];
                case 2:
                    _b = (_e.sent());
                    _e.label = 3;
                case 3:
                    userWithSameEmailAddress = _b;
                    if (userWithSameEmailAddress) {
                        return [2 /*return*/, res
                                .status(400)
                                .send((0, response_1.errorResponse)("User with that email exists", userReq.lang))];
                    }
                    _c = telephoneNumber;
                    if (!_c) return [3 /*break*/, 5];
                    return [4 /*yield*/, prisma.user.findFirst({
                            where: { telephoneNumber: telephoneNumber, id: { not: id } },
                        })];
                case 4:
                    _c = (_e.sent());
                    _e.label = 5;
                case 5:
                    userWithSameTelephoneNumber = _c;
                    if (userWithSameTelephoneNumber) {
                        return [2 /*return*/, res
                                .status(400)
                                .send((0, response_1.errorResponse)("User with that telephoneNumber exists", userReq.lang))];
                    }
                    _d = telephoneNumberHashed;
                    if (!_d) return [3 /*break*/, 7];
                    return [4 /*yield*/, prisma.user.findFirst({
                            where: { telephoneNumberHashed: telephoneNumberHashed, id: { not: id } },
                        })];
                case 6:
                    _d = (_e.sent());
                    _e.label = 7;
                case 7:
                    userWithSameTelephoneNumberHashed = _d;
                    if (userWithSameTelephoneNumberHashed) {
                        return [2 /*return*/, res
                                .status(400)
                                .send((0, response_1.errorResponse)("User with that telephoneNumberHashed exists", userReq.lang))];
                    }
                    return [4 /*yield*/, prisma.user.update({
                            where: { id: id },
                            data: {
                                telephoneNumber: telephoneNumber,
                                telephoneNumberHashed: telephoneNumberHashed,
                                emailAddress: emailAddress,
                                displayName: displayName,
                                avatarUrl: avatarUrl,
                            },
                        })];
                case 8:
                    user = _e.sent();
                    res.send((0, response_1.successResponse)({ user: (0, sanitize_1.default)(user).user() }));
                    return [3 /*break*/, 10];
                case 9:
                    e_1 = _e.sent();
                    (0, logger_1.error)(e_1);
                    res.status(500).send((0, response_1.errorResponse)("Server error " + e_1, userReq.lang));
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    }); });
    return router;
});
//# sourceMappingURL=me.js.map