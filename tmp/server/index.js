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
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var express_1 = __importDefault(require("express"));
var management_1 = __importDefault(require("./services/management"));
var messenger_1 = __importDefault(require("./services/messenger"));
var sms_1 = __importDefault(require("./services/sms"));
var upload_1 = __importDefault(require("./services/upload"));
var push_1 = __importDefault(require("./services/push"));
var sse_1 = __importDefault(require("./services/sse"));
var confcall_1 = __importDefault(require("./services/confcall"));
var amqplib_1 = __importDefault(require("amqplib"));
var logger_1 = require("./components/logger");
var app = (0, express_1.default)();
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var server, rabbitMQConnection, rabbitMQChannel, userManagementAPIService, messengerAPIService, smsService, uploadService, pushService, sseService, confcallService;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                app.use(express_1.default.json());
                app.use(express_1.default.urlencoded({ extended: true }));
                // cors
                app.use(function (req, res, next) {
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Methods", "*");
                    res.header("Access-Control-Allow-Headers", "*");
                    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, access-token, admin-accesstoken, accesstoken");
                    // intercept OPTIONS method
                    if ("OPTIONS" === req.method) {
                        res.send(200);
                    }
                    else {
                        next();
                    }
                });
                server = app.listen(process.env["SERVER_PORT"], function () {
                    console.log("Start on port " + process.env["SERVER_PORT"] + ".");
                });
                app.use(express_1.default.static("public"));
                return [4 /*yield*/, amqplib_1.default.connect(process.env["RABBITMQ_URL"] || "amqp://localhost")];
            case 1:
                rabbitMQConnection = _a.sent();
                return [4 /*yield*/, rabbitMQConnection.createChannel()];
            case 2:
                rabbitMQChannel = _a.sent();
                if (process.env["USE_MNG_API"]) {
                    userManagementAPIService = new management_1.default();
                    userManagementAPIService.start({
                        rabbitMQChannel: rabbitMQChannel,
                    });
                    app.use("/api/management", userManagementAPIService.getRoutes());
                }
                if (process.env["USE_MSG_API"]) {
                    messengerAPIService = new messenger_1.default();
                    messengerAPIService.start({
                        rabbitMQChannel: rabbitMQChannel,
                    });
                    app.use("/api/messenger", messengerAPIService.getRoutes());
                }
                if (process.env["USE_SMS"]) {
                    smsService = new sms_1.default();
                    smsService.start({
                        rabbitMQChannel: rabbitMQChannel,
                    });
                }
                if (process.env["USE_UPLOAD"]) {
                    uploadService = new upload_1.default();
                    uploadService.start({
                        rabbitMQChannel: rabbitMQChannel,
                    });
                    app.use("/api/upload", uploadService.getRoutes());
                }
                if (process.env["USE_PUSH"]) {
                    pushService = new push_1.default();
                    pushService.start({
                        rabbitMQChannel: rabbitMQChannel,
                    });
                }
                if (process.env["USE_SSE"]) {
                    sseService = new sse_1.default();
                    sseService.start({
                        rabbitMQChannel: rabbitMQChannel,
                    });
                    app.use("/api/sse", sseService.getRoutes());
                }
                if (process.env["USE_CONFCALL"]) {
                    confcallService = new confcall_1.default();
                    confcallService.start({
                        rabbitMQChannel: rabbitMQChannel,
                        server: server,
                    });
                    app.use("/api/confcall", confcallService.getRoutes());
                }
                // test
                app.get("/api/test", function (req, res) {
                    res.send("test");
                });
                // general error
                app.use(function (err, req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        (0, logger_1.error)(err);
                        return [2 /*return*/, res.status(500).send("Server Error " + err.message)];
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); })();
exports.default = app;
//# sourceMappingURL=index.js.map