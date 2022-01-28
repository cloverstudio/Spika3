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
var logger_1 = __importStar(require("../../components/logger"));
var url = require("url");
var protoo_server_1 = __importDefault(require("protoo-server"));
var mediasoup = __importStar(require("mediasoup"));
var awaitqueue_1 = require("awaitqueue");
var Room_1 = __importDefault(require("./lib/Room"));
var interactiveServer_1 = __importDefault(require("./lib/interactiveServer"));
var interactiveClient_1 = __importDefault(require("./lib/interactiveClient"));
var config_1 = __importDefault(require("./config"));
var ConfcallService = /** @class */ (function () {
    function ConfcallService() {
        this.testString = "test test";
        this.mediasoupWorkers = [];
        this.rooms = new Map();
        this.nextMediasoupWorkerIdx = 0;
    }
    ConfcallService.prototype.start = function (_a) {
        var rabbitMQChannel = _a.rabbitMQChannel, server = _a.server;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.server = server;
                        this.queue = new awaitqueue_1.AwaitQueue();
                        // Open the interactive server.
                        return [4 /*yield*/, (0, interactiveServer_1.default)()];
                    case 1:
                        // Open the interactive server.
                        _b.sent();
                        if (!(process.env.INTERACTIVE === "true" || process.env.INTERACTIVE === "1")) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, interactiveClient_1.default)()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: 
                    // Run a mediasoup Worker.
                    return [4 /*yield*/, this.runMediasoupWorkers()];
                    case 4:
                        // Run a mediasoup Worker.
                        _b.sent();
                        // Run a protoo WebSocketServer.
                        return [4 /*yield*/, this.runProtooWebSocketServer()];
                    case 5:
                        // Run a protoo WebSocketServer.
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Launch as many mediasoup Workers as given in the configuration file.
     */
    ConfcallService.prototype.runMediasoupWorkers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var numWorkers, _loop_1, this_1, i;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        numWorkers = config_1.default.mediasoup.numWorkers;
                        (0, logger_1.default)("running %d mediasoup Workers...", numWorkers);
                        _loop_1 = function (i) {
                            var worker;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, mediasoup.createWorker({
                                            logLevel: config_1.default.mediasoup.workerSettings
                                                .logLevel,
                                            logTags: config_1.default.mediasoup.workerSettings
                                                .logTags,
                                            rtcMinPort: Number(config_1.default.mediasoup.workerSettings.rtcMinPort),
                                            rtcMaxPort: Number(config_1.default.mediasoup.workerSettings.rtcMaxPort),
                                        })];
                                    case 1:
                                        worker = _b.sent();
                                        worker.on("died", function () {
                                            (0, logger_1.error)("mediasoup Worker died, exiting  in 2 seconds... [pid:%d]", worker.pid);
                                            setTimeout(function () { return process.exit(1); }, 2000);
                                        });
                                        this_1.mediasoupWorkers.push(worker);
                                        // Log worker resource usage every X seconds.
                                        setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                                            var usage;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, worker.getResourceUsage()];
                                                    case 1:
                                                        usage = _a.sent();
                                                        (0, logger_1.default)("mediasoup Worker resource usage [pid:%d]: %o", worker.pid, usage);
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); }, 120000);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < numWorkers)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(i)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        ++i;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ConfcallService.prototype.getRoutes = function () {
        var _this = this;
        var confcallRouter = (0, express_1.Router)();
        confcallRouter.get("/test", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                res.send(this.testString);
                return [2 /*return*/];
            });
        }); });
        /**
         * For every API request, verify that the roomId in the path matches and
         * existing room.
         */
        confcallRouter.param("roomId", function (reqOrig, res, next, roomId) {
            // The room must exist for all API requests.
            var req = reqOrig;
            if (!_this.rooms.has(roomId)) {
                var error = new Error("room with id \"" + roomId + "\" not found");
                error.status = 404;
                throw error;
            }
            req.room = _this.rooms.get(roomId);
            next();
        });
        /**
         * API GET resource that returns the mediasoup Router RTP capabilities of
         * the room.
         */
        confcallRouter.get("/rooms/:roomId", function (reqOrig, res) {
            var req = reqOrig;
            (0, logger_1.default)("1");
            var data = req.room.getRouterRtpCapabilities();
            (0, logger_1.default)("2");
            res.status(200).json(data);
        });
        /**
         * POST API to create a Broadcaster.
         */
        confcallRouter.post("/rooms/:roomId/broadcasters", function (reqOrig, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var req, _a, id, displayName, device, rtpCapabilities, data, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        req = reqOrig;
                        _a = req.body, id = _a.id, displayName = _a.displayName, device = _a.device, rtpCapabilities = _a.rtpCapabilities;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, req.room.createBroadcaster({
                                id: id,
                                displayName: displayName,
                                device: device,
                                rtpCapabilities: rtpCapabilities,
                            })];
                    case 2:
                        data = _b.sent();
                        res.status(200).json(data);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        next(error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        /**
         * DELETE API to delete a Broadcaster.
         */
        confcallRouter.delete("/rooms/:roomId/broadcasters/:broadcasterId", function (reqOrig, res) {
            var req = reqOrig;
            var broadcasterId = req.params.broadcasterId;
            req.room.deleteBroadcaster({ broadcasterId: broadcasterId });
            res.status(200).send("broadcaster deleted");
        });
        /**
         * POST API to create a mediasoup Transport associated to a Broadcaster.
         * It can be a PlainTransport or a WebRtcTransport depending on the
         * type parameters in the body. There are also additional parameters for
         * PlainTransport.
         */
        confcallRouter.post("/rooms/:roomId/broadcasters/:broadcasterId/transports", function (reqOrig, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var req, broadcasterId, _a, type, rtcpMux, comedia, sctpCapabilities, data, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        req = reqOrig;
                        broadcasterId = req.params.broadcasterId;
                        _a = req.body, type = _a.type, rtcpMux = _a.rtcpMux, comedia = _a.comedia, sctpCapabilities = _a.sctpCapabilities;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, req.room.createBroadcasterTransport({
                                broadcasterId: broadcasterId,
                                type: type,
                                rtcpMux: rtcpMux,
                                comedia: comedia,
                                sctpCapabilities: sctpCapabilities,
                            })];
                    case 2:
                        data = _b.sent();
                        res.status(200).json(data);
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _b.sent();
                        next(error_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        /**
         * POST API to connect a Transport belonging to a Broadcaster. Not needed
         * for PlainTransport if it was created with comedia option set to true.
         */
        confcallRouter.post("/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/connect", function (reqOrig, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var req, _a, broadcasterId, transportId, dtlsParameters, data, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        req = reqOrig;
                        _a = req.params, broadcasterId = _a.broadcasterId, transportId = _a.transportId;
                        dtlsParameters = req.body.dtlsParameters;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, req.room.connectBroadcasterTransport({
                                broadcasterId: broadcasterId,
                                transportId: transportId,
                                dtlsParameters: dtlsParameters,
                            })];
                    case 2:
                        data = _b.sent();
                        res.status(200).json(data);
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _b.sent();
                        next(error_3);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        /**
         * POST API to create a mediasoup Producer associated to a Broadcaster.
         * The exact Transport in which the Producer must be created is signaled in
         * the URL path. Body parameters include kind and rtpParameters of the
         * Producer.
         */
        confcallRouter.post("/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/producers", function (reqOrig, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var req, _a, broadcasterId, transportId, _b, kind, rtpParameters, data, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        req = reqOrig;
                        _a = req.params, broadcasterId = _a.broadcasterId, transportId = _a.transportId;
                        _b = req.body, kind = _b.kind, rtpParameters = _b.rtpParameters;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, req.room.createBroadcasterProducer({
                                broadcasterId: broadcasterId,
                                transportId: transportId,
                                kind: kind,
                                rtpParameters: rtpParameters,
                            })];
                    case 2:
                        data = _c.sent();
                        res.status(200).json(data);
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _c.sent();
                        next(error_4);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        /**
         * POST API to create a mediasoup Consumer associated to a Broadcaster.
         * The exact Transport in which the Consumer must be created is signaled in
         * the URL path. Query parameters must include the desired producerId to
         * consume.
         */
        confcallRouter.post("/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/consume", function (reqOrig, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var req, _a, broadcasterId, transportId, producerId, data, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        req = reqOrig;
                        _a = req.params, broadcasterId = _a.broadcasterId, transportId = _a.transportId;
                        producerId = req.query.producerId;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, req.room.createBroadcasterConsumer({
                                broadcasterId: broadcasterId,
                                transportId: transportId,
                                producerId: producerId,
                            })];
                    case 2:
                        data = _b.sent();
                        res.status(200).json(data);
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _b.sent();
                        next(error_5);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        /**
         * POST API to create a mediasoup DataConsumer associated to a Broadcaster.
         * The exact Transport in which the DataConsumer must be created is signaled in
         * the URL path. Query body must include the desired producerId to
         * consume.
         */
        confcallRouter.post("/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/consume/data", function (reqOrig, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var req, _a, broadcasterId, transportId, dataProducerId, data, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        req = reqOrig;
                        _a = req.params, broadcasterId = _a.broadcasterId, transportId = _a.transportId;
                        dataProducerId = req.body.dataProducerId;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, req.room.createBroadcasterDataConsumer({
                                broadcasterId: broadcasterId,
                                transportId: transportId,
                                dataProducerId: dataProducerId,
                            })];
                    case 2:
                        data = _b.sent();
                        res.status(200).json(data);
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _b.sent();
                        next(error_6);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        /**
         * POST API to create a mediasoup DataProducer associated to a Broadcaster.
         * The exact Transport in which the DataProducer must be created is signaled in
         */
        confcallRouter.post("/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/produce/data", function (reqOrig, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var req, _a, broadcasterId, transportId, _b, label, protocol, sctpStreamParameters, appData, data, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        req = reqOrig;
                        _a = req.params, broadcasterId = _a.broadcasterId, transportId = _a.transportId;
                        _b = req.body, label = _b.label, protocol = _b.protocol, sctpStreamParameters = _b.sctpStreamParameters, appData = _b.appData;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, req.room.createBroadcasterDataProducer({
                                broadcasterId: broadcasterId,
                                transportId: transportId,
                                label: label,
                                protocol: protocol,
                                sctpStreamParameters: sctpStreamParameters,
                                appData: appData,
                            })];
                    case 2:
                        data = _c.sent();
                        res.status(200).json(data);
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _c.sent();
                        next(error_7);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        /**
         * Error handler.
         */
        confcallRouter.use(function (error, reqOrig, res, next) {
            var req = reqOrig;
            if (error) {
                (0, logger_1.warn)("Express app %s", String(error));
                error.status = error.status || (error.name === "TypeError" ? 400 : 500);
                res.statusMessage = error.message;
                res.status(error.status).send(String(error));
            }
            else {
                next();
            }
        });
        return confcallRouter;
    };
    /**
     * Create a protoo WebSocketServer to allow WebSocket connections from browsers.
     */
    ConfcallService.prototype.runProtooWebSocketServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                (0, logger_1.default)("running protoo WebSocketServer...");
                // Create the protoo WebSocket server.
                this.protooWebSocketServer = new protoo_server_1.default.WebSocketServer(this.server, {
                    maxReceivedFrameSize: 960000,
                    maxReceivedMessageSize: 960000,
                    fragmentOutgoingMessages: true,
                    fragmentationThreshold: 960000,
                });
                // Handle connections from clients.
                this.protooWebSocketServer.on("connectionrequest", function (info, accept, reject) {
                    // The client indicates the roomId and peerId in the URL query.
                    var u = url.parse(info.request.url, true);
                    var roomId = u.query["roomId"];
                    var peerId = u.query["peerId"];
                    if (!roomId || !peerId) {
                        reject(400, "Connection request without roomId and/or peerId");
                        return;
                    }
                    (0, logger_1.default)("protoo connection request [roomId:%s, peerId:%s, address:%s, origin:%s]", roomId, peerId, info.socket.remoteAddress, info.origin);
                    // Serialize this code into the queue to avoid that two peers connecting at
                    // the same time with the same roomId create two separate rooms with same
                    // roomId.
                    _this.queue
                        .push(function () { return __awaiter(_this, void 0, void 0, function () {
                        var room, protooWebSocketTransport;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.getOrCreateRoom({ roomId: roomId })];
                                case 1:
                                    room = _a.sent();
                                    protooWebSocketTransport = accept();
                                    room.handleProtooConnection({
                                        peerId: peerId,
                                        protooWebSocketTransport: protooWebSocketTransport,
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); })
                        .catch(function (error) {
                        (0, logger_1.error)("room creation or room joining failed:%o", error);
                        reject(error);
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get a Room instance (or create one if it does not exist).
     */
    ConfcallService.prototype.getOrCreateRoom = function (_a) {
        var roomId = _a.roomId;
        return __awaiter(this, void 0, void 0, function () {
            var room, mediasoupWorker;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        room = this.rooms.get(roomId);
                        if (!!room) return [3 /*break*/, 2];
                        (0, logger_1.default)("creating a new Room [roomId:%s]", roomId);
                        mediasoupWorker = this.getMediasoupWorker();
                        return [4 /*yield*/, Room_1.default.create({ mediasoupWorker: mediasoupWorker, roomId: roomId })];
                    case 1:
                        room = _b.sent();
                        this.rooms.set(roomId, room);
                        room.on("close", function () { return _this.rooms.delete(roomId); });
                        _b.label = 2;
                    case 2: return [2 /*return*/, room];
                }
            });
        });
    };
    ConfcallService.prototype.getMediasoupWorker = function () {
        var worker = this.mediasoupWorkers[this.nextMediasoupWorkerIdx];
        if (++this.nextMediasoupWorkerIdx === this.mediasoupWorkers.length)
            this.nextMediasoupWorkerIdx = 0;
        return worker;
    };
    ConfcallService.prototype.test = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    return ConfcallService;
}());
exports.default = ConfcallService;
//# sourceMappingURL=index.js.map