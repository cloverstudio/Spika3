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
var mocha_1 = require("mocha");
var chai_1 = __importStar(require("chai"));
var server_1 = __importDefault(require("../server"));
var notificationServer_1 = __importDefault(require("../server/services/sse/notificationServer"));
var global_1 = __importDefault(require("./global"));
var Constants = __importStar(require("../server/components/consts"));
var eventsource_1 = __importDefault(require("eventsource"));
var utils_1 = require("../client/lib/utils");
describe("SSE Service", function () {
    describe("NotificationServer", function () {
        var notificationServer;
        (0, mocha_1.beforeEach)(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        notificationServer = new notificationServer_1.default(global_1.default.rabbitMQChannel);
                        return [4 /*yield*/, (0, utils_1.wait)(0.2)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, mocha_1.afterEach)(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, notificationServer.destroy()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("Can save connection", function () { return __awaiter(void 0, void 0, void 0, function () {
            var channelId, allConnections, connection;
            return __generator(this, function (_a) {
                channelId = "channelId";
                notificationServer.subscribe(channelId, console.log);
                (0, chai_1.expect)(notificationServer.connections).to.be.an("object");
                allConnections = Object.values(notificationServer.connections);
                (0, chai_1.expect)(allConnections).to.be.an("array");
                (0, chai_1.expect)(allConnections).to.have.lengthOf(1);
                connection = allConnections[0];
                (0, chai_1.expect)(connection).to.be.an("object");
                (0, chai_1.expect)(connection.channelId).to.eqls(channelId);
                return [2 /*return*/];
            });
        }); });
        it("Can subscribe to channel get notification", function () { return __awaiter(void 0, void 0, void 0, function () {
            var channelId, data, eventSpy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        channelId = "channelId";
                        data = { foo: "bar" };
                        eventSpy = chai_1.default.spy(function (_) { return true; });
                        notificationServer.subscribe(channelId, eventSpy);
                        notificationServer.send(channelId, data);
                        return [4 /*yield*/, (0, utils_1.wait)(0.2)];
                    case 1:
                        _a.sent();
                        (0, chai_1.expect)(eventSpy).to.have.been.called.once;
                        (0, chai_1.expect)(eventSpy).to.have.been.called.with(data);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Can subscribe to channel get multiple notifications", function () { return __awaiter(void 0, void 0, void 0, function () {
            var channelId, data, eventSpy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        channelId = "channelId";
                        data = { foo: "bar" };
                        eventSpy = chai_1.default.spy(function (_) { return true; });
                        notificationServer.subscribe(channelId, eventSpy);
                        notificationServer.send(channelId, data);
                        notificationServer.send(channelId, data);
                        return [4 /*yield*/, (0, utils_1.wait)(0.2)];
                    case 1:
                        _a.sent();
                        (0, chai_1.expect)(eventSpy).to.have.been.called.exactly(2);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Send is triggered by pushing data to SSE queue", function () { return __awaiter(void 0, void 0, void 0, function () {
            var channelId, data, eventSpy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        channelId = "channelId";
                        data = { foo: "bar" };
                        eventSpy = chai_1.default.spy(function (_) { return true; });
                        notificationServer.subscribe(channelId, eventSpy);
                        global_1.default.rabbitMQChannel.sendToQueue(Constants.QUEUE_SSE, Buffer.from(JSON.stringify({
                            channelId: channelId,
                            data: data,
                        })));
                        return [4 /*yield*/, (0, utils_1.wait)(0.2)];
                    case 1:
                        _a.sent();
                        (0, chai_1.expect)(eventSpy).to.have.been.called.once;
                        (0, chai_1.expect)(eventSpy).to.have.been.called.with(data);
                        return [2 /*return*/];
                }
            });
        }); });
        it("Gets only subscribed channels notifications", function () { return __awaiter(void 0, void 0, void 0, function () {
            var channelId, channelTwoId, data, eventSpyOne, eventSpyTwo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        channelId = "channelId";
                        channelTwoId = "channelTwoId";
                        data = { foo: "bar" };
                        eventSpyOne = chai_1.default.spy(function (_) { return true; });
                        eventSpyTwo = chai_1.default.spy(function (_) { return true; });
                        notificationServer.subscribe(channelId, eventSpyOne);
                        notificationServer.subscribe(channelTwoId, eventSpyTwo);
                        notificationServer.send(channelId, data);
                        return [4 /*yield*/, (0, utils_1.wait)(0.2)];
                    case 1:
                        _a.sent();
                        (0, chai_1.expect)(eventSpyOne).to.have.been.called.once;
                        (0, chai_1.expect)(eventSpyTwo).to.not.have.been.called();
                        return [2 /*return*/];
                }
            });
        }); });
        it("Can unsubscribe", function () { return __awaiter(void 0, void 0, void 0, function () {
            var channelId, data, eventSpy, connectionId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        channelId = "channelId";
                        data = { foo: "bar" };
                        eventSpy = chai_1.default.spy(function (_) { return true; });
                        connectionId = notificationServer.subscribe(channelId, eventSpy);
                        notificationServer.unsubscribe(connectionId);
                        notificationServer.send(channelId, data);
                        return [4 /*yield*/, (0, utils_1.wait)(0.2)];
                    case 1:
                        _a.sent();
                        (0, chai_1.expect)(eventSpy).to.not.have.been.called();
                        return [2 /*return*/];
                }
            });
        }); });
        it("Can be destroyed", function () { return __awaiter(void 0, void 0, void 0, function () {
            var channelId, data, eventSpy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        channelId = "channelId";
                        data = { foo: "bar" };
                        eventSpy = chai_1.default.spy(function (_) { return true; });
                        notificationServer.subscribe(channelId, eventSpy);
                        return [4 /*yield*/, notificationServer.destroy()];
                    case 1:
                        _a.sent();
                        notificationServer.send(channelId, data);
                        return [4 /*yield*/, (0, utils_1.wait)(0.2)];
                    case 2:
                        _a.sent();
                        (0, chai_1.expect)(eventSpy).to.not.have.been.called();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("SSE API", function () {
        var server;
        (0, mocha_1.before)(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (res) {
                        server = server_1.default.listen(3020, function () {
                            res();
                        });
                    })];
            });
        }); });
        (0, mocha_1.after)(function () {
            server.close();
        });
        it("Sends event-stream", function () { return __awaiter(void 0, void 0, void 0, function () {
            var channelId, data, eventSpy, source;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        channelId = "channelId";
                        data = { foo: "bar" };
                        eventSpy = chai_1.default.spy(function (_) { return true; });
                        source = new eventsource_1.default("http://localhost:3020/api/sse/" + channelId + "?accesstoken=" + global_1.default.userToken);
                        source.onmessage = function (event) {
                            eventSpy(event.data);
                        };
                        return [4 /*yield*/, (0, utils_1.wait)(0.2)];
                    case 1:
                        _a.sent();
                        // send data
                        global_1.default.rabbitMQChannel.sendToQueue(Constants.QUEUE_SSE, Buffer.from(JSON.stringify({
                            channelId: channelId,
                            data: data,
                        })));
                        return [4 /*yield*/, (0, utils_1.wait)(0.1)];
                    case 2:
                        _a.sent();
                        (0, chai_1.expect)(eventSpy).to.have.been.called.once;
                        (0, chai_1.expect)(eventSpy).to.have.been.called.with(JSON.stringify(data));
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=12_server_sent_events.js.map