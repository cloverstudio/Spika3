"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var EventEmitter = require("events").EventEmitter;
var throttle = require("@sitespeed.io/throttle");
var config = require("../config");
var Bot = require("./Bot");
var protoo_server_1 = __importDefault(require("protoo-server"));
var logger_1 = __importStar(require("../../../components/logger"));
/**
 * Room class.
 *
 * This is not a "mediasoup Room" by itself, by a custom class that holds
 * a protoo Room (for signaling with WebSocket clients) and a mediasoup Router
 * (for sending and receiving media to/from those WebSocket peers).
 */
var Room = /** @class */ (function (_super) {
    __extends(Room, _super);
    function Room(_a) {
        var roomId = _a.roomId, protooRoom = _a.protooRoom, mediasoupRouter = _a.mediasoupRouter, audioLevelObserver = _a.audioLevelObserver, bot = _a.bot;
        var _this = _super.call(this) || this;
        _this.setMaxListeners(Infinity);
        // Room id.
        // @type {String}
        _this._roomId = roomId;
        // Closed flag.
        // @type {Boolean}
        _this._closed = false;
        // protoo Room instance.
        // @type {protoo.Room}
        _this._protooRoom = protooRoom;
        // Map of broadcasters indexed by id. Each Object has:
        // - {String} id
        // - {Object} data
        //   - {String} displayName
        //   - {Object} device
        //   - {RTCRtpCapabilities} rtpCapabilities
        //   - {Map<String, mediasoup.Transport>} transports
        //   - {Map<String, mediasoup.Producer>} producers
        //   - {Map<String, mediasoup.Consumers>} consumers
        //   - {Map<String, mediasoup.DataProducer>} dataProducers
        //   - {Map<String, mediasoup.DataConsumers>} dataConsumers
        // @type {Map<String, Object>}
        _this._broadcasters = new Map();
        // mediasoup Router instance.
        // @type {mediasoup.Router}
        _this._mediasoupRouter = mediasoupRouter;
        // mediasoup AudioLevelObserver.
        // @type {mediasoup.AudioLevelObserver}
        _this._audioLevelObserver = audioLevelObserver;
        // DataChannel bot.
        // @type {Bot}
        _this._bot = bot;
        // Network throttled.
        // @type {Boolean}
        _this._networkThrottled = false;
        // Handle audioLevelObserver.
        _this._handleAudioLevelObserver();
        // For debugging.
        global.audioLevelObserver = _this._audioLevelObserver;
        global.bot = _this._bot;
        return _this;
    }
    /**
     * Factory function that creates and returns Room instance.
     *
     * @async
     *
     * @param {mediasoup.Worker} mediasoupWorker - The mediasoup Worker in which a new
     *   mediasoup Router must be created.
     * @param {String} roomId - Id of the Room instance.
     */
    Room.create = function (_a) {
        var mediasoupWorker = _a.mediasoupWorker, roomId = _a.roomId;
        return __awaiter(this, void 0, void 0, function () {
            var protooRoom, mediaCodecs, mediasoupRouter, audioLevelObserver, bot;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        (0, logger_1.default)("create() [roomId:%s]", roomId);
                        protooRoom = new protoo_server_1.default.Room();
                        mediaCodecs = config.mediasoup.routerOptions.mediaCodecs;
                        return [4 /*yield*/, mediasoupWorker.createRouter({ mediaCodecs: mediaCodecs })];
                    case 1:
                        mediasoupRouter = _b.sent();
                        return [4 /*yield*/, mediasoupRouter.createAudioLevelObserver({
                                maxEntries: 1,
                                threshold: -80,
                                interval: 800,
                            })];
                    case 2:
                        audioLevelObserver = _b.sent();
                        return [4 /*yield*/, Bot.create({ mediasoupRouter: mediasoupRouter })];
                    case 3:
                        bot = _b.sent();
                        return [2 /*return*/, new Room({
                                roomId: roomId,
                                protooRoom: protooRoom,
                                mediasoupRouter: mediasoupRouter,
                                audioLevelObserver: audioLevelObserver,
                                bot: bot,
                            })];
                }
            });
        });
    };
    /**
     * Closes the Room instance by closing the protoo Room and the mediasoup Router.
     */
    Room.prototype.close = function () {
        (0, logger_1.default)("close()");
        this._closed = true;
        // Close the protoo Room.
        this._protooRoom.close();
        // Close the mediasoup Router.
        this._mediasoupRouter.close();
        // Close the Bot.
        this._bot.close();
        // Emit 'close' event.
        this.emit("close");
        // Stop network throttling.
        if (this._networkThrottled) {
            throttle.stop({}).catch(function () { });
        }
    };
    Room.prototype.logStatus = function () {
        (0, logger_1.default)("logStatus() [roomId:%s, protoo Peers:%s, mediasoup Transports:%s]", this._roomId, this._protooRoom.peers.length, this._mediasoupRouter._transports.size); // NOTE: Private API.
    };
    /**
     * Called from server.js upon a protoo WebSocket connection request from a
     * browser.
     *
     * @param {String} peerId - The id of the protoo peer to be created.
     * @param {Boolean} consume - Whether this peer wants to consume from others.
     * @param {protoo.WebSocketTransport} protooWebSocketTransport - The associated
     *   protoo WebSocket transport.
     */
    Room.prototype.handleProtooConnection = function (param) {
        var _this = this;
        var peerId = param.peerId, consume = param.consume, protooWebSocketTransport = param.protooWebSocketTransport;
        var existingPeer = this._protooRoom.getPeer(peerId);
        if (existingPeer) {
            (0, logger_1.warn)("handleProtooConnection() | there is already a protoo Peer with same peerId, closing it [peerId:%s]", peerId);
            existingPeer.close();
        }
        var peer;
        // Create a new protoo Peer with the given peerId.
        try {
            peer = this._protooRoom.createPeer(peerId, protooWebSocketTransport);
        }
        catch (error) {
            (0, logger_1.error)("protooRoom.createPeer() failed:%o", error);
        }
        // Use the peer.data object to store mediasoup related objects.
        // Not joined after a custom protoo 'join' request is later received.
        peer.data.consume = consume;
        peer.data.joined = false;
        peer.data.displayName = undefined;
        peer.data.device = undefined;
        peer.data.rtpCapabilities = undefined;
        peer.data.sctpCapabilities = undefined;
        // Have mediasoup related maps ready even before the Peer joins since we
        // allow creating Transports before joining.
        peer.data.transports = new Map();
        peer.data.producers = new Map();
        peer.data.consumers = new Map();
        peer.data.dataProducers = new Map();
        peer.data.dataConsumers = new Map();
        peer.on("request", function (request, accept, reject) {
            (0, logger_1.default)('protoo Peer "request" event [method:%s, peerId:%s]', request.method, peer.id);
            _this._handleProtooRequest(peer, request, accept, reject).catch(function (error) {
                (0, logger_1.error)("request failed:%o", error);
                reject(error);
            });
        });
        peer.on("close", function () {
            if (_this._closed)
                return;
            (0, logger_1.default)('protoo Peer "close" event [peerId:%s]', peer.id);
            // If the Peer was joined, notify all Peers.
            if (peer.data.joined) {
                for (var _i = 0, _a = _this._getJoinedPeers({ excludePeer: peer }); _i < _a.length; _i++) {
                    var otherPeer = _a[_i];
                    otherPeer.notify("peerClosed", { peerId: peer.id }).catch(function () { });
                }
            }
            // Iterate and close all mediasoup Transport associated to this Peer, so all
            // its Producers and Consumers will also be closed.
            for (var _b = 0, _c = peer.data.transports.values(); _b < _c.length; _b++) {
                var transport = _c[_b];
                transport.close();
            }
            // If this is the latest Peer in the room, close the room.
            if (_this._protooRoom.peers.length === 0) {
                (0, logger_1.default)("last Peer in the room left, closing the room [roomId:%s]", _this._roomId);
                _this.close();
            }
        });
    };
    Room.prototype.getRouterRtpCapabilities = function () {
        return this._mediasoupRouter.rtpCapabilities;
    };
    /**
     * Create a Broadcaster. This is for HTTP API requests (see server.js).
     *
     * @async
     *
     * @type {String} id - Broadcaster id.
     * @type {String} displayName - Descriptive name.
     * @type {Object} [device] - Additional info with name, version and flags fields.
     * @type {RTCRtpCapabilities} [rtpCapabilities] - Device RTP capabilities.
     */
    Room.prototype.createBroadcaster = function (_a) {
        var id = _a.id, displayName = _a.displayName, _b = _a.device, device = _b === void 0 ? {} : _b, rtpCapabilities = _a.rtpCapabilities;
        return __awaiter(this, void 0, void 0, function () {
            var broadcaster, _i, _c, otherPeer, peerInfos, joinedPeers, _d, joinedPeers_1, joinedPeer, peerInfo, _e, _f, producer;
            return __generator(this, function (_g) {
                if (typeof id !== "string" || !id)
                    throw new TypeError("missing body.id");
                else if (typeof displayName !== "string" || !displayName)
                    throw new TypeError("missing body.displayName");
                else if (typeof device.name !== "string" || !device.name)
                    throw new TypeError("missing body.device.name");
                else if (rtpCapabilities && typeof rtpCapabilities !== "object")
                    throw new TypeError("wrong body.rtpCapabilities");
                if (this._broadcasters.has(id))
                    throw new Error("broadcaster with id \"" + id + "\" already exists");
                broadcaster = {
                    id: id,
                    data: {
                        displayName: displayName,
                        device: {
                            flag: "broadcaster",
                            name: device.name || "Unknown device",
                            version: device.version,
                        },
                        rtpCapabilities: rtpCapabilities,
                        transports: new Map(),
                        producers: new Map(),
                        consumers: new Map(),
                        dataProducers: new Map(),
                        dataConsumers: new Map(),
                    },
                };
                // Store the Broadcaster into the map.
                this._broadcasters.set(broadcaster.id, broadcaster);
                // Notify the new Broadcaster to all Peers.
                for (_i = 0, _c = this._getJoinedPeers(); _i < _c.length; _i++) {
                    otherPeer = _c[_i];
                    otherPeer
                        .notify("newPeer", {
                        id: broadcaster.id,
                        displayName: broadcaster.data.displayName,
                        device: broadcaster.data.device,
                    })
                        .catch(function () { });
                }
                peerInfos = [];
                joinedPeers = this._getJoinedPeers();
                // Just fill the list of Peers if the Broadcaster provided its rtpCapabilities.
                if (rtpCapabilities) {
                    for (_d = 0, joinedPeers_1 = joinedPeers; _d < joinedPeers_1.length; _d++) {
                        joinedPeer = joinedPeers_1[_d];
                        peerInfo = {
                            id: joinedPeer.id,
                            displayName: joinedPeer.data.displayName,
                            device: joinedPeer.data.device,
                            producers: [],
                        };
                        for (_e = 0, _f = joinedPeer.data.producers.values(); _e < _f.length; _e++) {
                            producer = _f[_e];
                            // Ignore Producers that the Broadcaster cannot consume.
                            if (!this._mediasoupRouter.canConsume({
                                producerId: producer.id,
                                rtpCapabilities: rtpCapabilities,
                            })) {
                                continue;
                            }
                            peerInfo.producers.push({
                                id: producer.id,
                                kind: producer.kind,
                            });
                        }
                        peerInfos.push(peerInfo);
                    }
                }
                return [2 /*return*/, { peers: peerInfos }];
            });
        });
    };
    /**
     * Delete a Broadcaster.
     *
     * @type {String} broadcasterId
     */
    Room.prototype.deleteBroadcaster = function (_a) {
        var broadcasterId = _a.broadcasterId;
        var broadcaster = this._broadcasters.get(broadcasterId);
        if (!broadcaster)
            throw new Error("broadcaster with id \"" + broadcasterId + "\" does not exist");
        for (var _i = 0, _b = broadcaster.data.transports.values(); _i < _b.length; _i++) {
            var transport = _b[_i];
            transport.close();
        }
        this._broadcasters.delete(broadcasterId);
        for (var _c = 0, _d = this._getJoinedPeers(); _c < _d.length; _c++) {
            var peer = _d[_c];
            peer.notify("peerClosed", { peerId: broadcasterId }).catch(function () { });
        }
    };
    /**
     * Create a mediasoup Transport associated to a Broadcaster. It can be a
     * PlainTransport or a WebRtcTransport.
     *
     * @async
     *
     * @type {String} broadcasterId
     * @type {String} type - Can be 'plain' (PlainTransport) or 'webrtc'
     *   (WebRtcTransport).
     * @type {Boolean} [rtcpMux=false] - Just for PlainTransport, use RTCP mux.
     * @type {Boolean} [comedia=true] - Just for PlainTransport, enable remote IP:port
     *   autodetection.
     * @type {Object} [sctpCapabilities] - SCTP capabilities
     */
    Room.prototype.createBroadcasterTransport = function (_a) {
        var broadcasterId = _a.broadcasterId, type = _a.type, _b = _a.rtcpMux, rtcpMux = _b === void 0 ? false : _b, _c = _a.comedia, comedia = _c === void 0 ? true : _c, sctpCapabilities = _a.sctpCapabilities;
        return __awaiter(this, void 0, void 0, function () {
            var broadcaster, _d, webRtcTransportOptions, transport, plainTransportOptions, transport;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        broadcaster = this._broadcasters.get(broadcasterId);
                        if (!broadcaster)
                            throw new Error("broadcaster with id \"" + broadcasterId + "\" does not exist");
                        _d = type;
                        switch (_d) {
                            case "webrtc": return [3 /*break*/, 1];
                            case "plain": return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1:
                        webRtcTransportOptions = __assign(__assign({}, config.mediasoup.webRtcTransportOptions), { enableSctp: Boolean(sctpCapabilities), numSctpStreams: (sctpCapabilities || {}).numStreams });
                        return [4 /*yield*/, this._mediasoupRouter.createWebRtcTransport(webRtcTransportOptions)];
                    case 2:
                        transport = _e.sent();
                        // Store it.
                        broadcaster.data.transports.set(transport.id, transport);
                        return [2 /*return*/, {
                                id: transport.id,
                                iceParameters: transport.iceParameters,
                                iceCandidates: transport.iceCandidates,
                                dtlsParameters: transport.dtlsParameters,
                                sctpParameters: transport.sctpParameters,
                            }];
                    case 3:
                        plainTransportOptions = __assign(__assign({}, config.mediasoup.plainTransportOptions), { rtcpMux: rtcpMux, comedia: comedia });
                        return [4 /*yield*/, this._mediasoupRouter.createPlainTransport(plainTransportOptions)];
                    case 4:
                        transport = _e.sent();
                        // Store it.
                        broadcaster.data.transports.set(transport.id, transport);
                        return [2 /*return*/, {
                                id: transport.id,
                                ip: transport.tuple.localIp,
                                port: transport.tuple.localPort,
                                rtcpPort: transport.rtcpTuple ? transport.rtcpTuple.localPort : undefined,
                            }];
                    case 5:
                        {
                            throw new TypeError("invalid type");
                        }
                        _e.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Connect a Broadcaster mediasoup WebRtcTransport.
     *
     * @async
     *
     * @type {String} broadcasterId
     * @type {String} transportId
     * @type {RTCDtlsParameters} dtlsParameters - Remote DTLS parameters.
     */
    Room.prototype.connectBroadcasterTransport = function (_a) {
        var broadcasterId = _a.broadcasterId, transportId = _a.transportId, dtlsParameters = _a.dtlsParameters;
        return __awaiter(this, void 0, void 0, function () {
            var broadcaster, transport;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        broadcaster = this._broadcasters.get(broadcasterId);
                        if (!broadcaster)
                            throw new Error("broadcaster with id \"" + broadcasterId + "\" does not exist");
                        transport = broadcaster.data.transports.get(transportId);
                        if (!transport)
                            throw new Error("transport with id \"" + transportId + "\" does not exist");
                        if (transport.constructor.name !== "WebRtcTransport") {
                            throw new Error("transport with id \"" + transportId + "\" is not a WebRtcTransport");
                        }
                        return [4 /*yield*/, transport.connect({ dtlsParameters: dtlsParameters })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a mediasoup Producer associated to a Broadcaster.
     *
     * @async
     *
     * @type {String} broadcasterId
     * @type {String} transportId
     * @type {String} kind - 'audio' or 'video' kind for the Producer.
     * @type {RTCRtpParameters} rtpParameters - RTP parameters for the Producer.
     */
    Room.prototype.createBroadcasterProducer = function (_a) {
        var broadcasterId = _a.broadcasterId, transportId = _a.transportId, kind = _a.kind, rtpParameters = _a.rtpParameters;
        return __awaiter(this, void 0, void 0, function () {
            var broadcaster, transport, producer, _i, _b, peer;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        broadcaster = this._broadcasters.get(broadcasterId);
                        if (!broadcaster)
                            throw new Error("broadcaster with id \"" + broadcasterId + "\" does not exist");
                        transport = broadcaster.data.transports.get(transportId);
                        if (!transport)
                            throw new Error("transport with id \"" + transportId + "\" does not exist");
                        return [4 /*yield*/, transport.produce({ kind: kind, rtpParameters: rtpParameters })];
                    case 1:
                        producer = _c.sent();
                        // Store it.
                        broadcaster.data.producers.set(producer.id, producer);
                        // Set Producer events.
                        // producer.on('score', (score) =>
                        // {
                        // 	l(
                        // 		'broadcaster producer "score" event [producerId:%s, score:%o]',
                        // 		producer.id, score);
                        // });
                        producer.on("videoorientationchange", function (videoOrientation) {
                            (0, logger_1.default)('broadcaster producer "videoorientationchange" event [producerId:%s, videoOrientation:%o]', producer.id, videoOrientation);
                        });
                        // Optimization: Create a server-side Consumer for each Peer.
                        for (_i = 0, _b = this._getJoinedPeers(); _i < _b.length; _i++) {
                            peer = _b[_i];
                            this._createConsumer({
                                consumerPeer: peer,
                                producerPeer: broadcaster,
                                producer: producer,
                            });
                        }
                        // Add into the audioLevelObserver.
                        if (producer.kind === "audio") {
                            this._audioLevelObserver.addProducer({ producerId: producer.id }).catch(function () { });
                        }
                        return [2 /*return*/, { id: producer.id }];
                }
            });
        });
    };
    /**
     * Create a mediasoup Consumer associated to a Broadcaster.
     *
     * @async
     *
     * @type {String} broadcasterId
     * @type {String} transportId
     * @type {String} producerId
     */
    Room.prototype.createBroadcasterConsumer = function (_a) {
        var broadcasterId = _a.broadcasterId, transportId = _a.transportId, producerId = _a.producerId;
        return __awaiter(this, void 0, void 0, function () {
            var broadcaster, transport, consumer;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        broadcaster = this._broadcasters.get(broadcasterId);
                        if (!broadcaster)
                            throw new Error("broadcaster with id \"" + broadcasterId + "\" does not exist");
                        if (!broadcaster.data.rtpCapabilities)
                            throw new Error("broadcaster does not have rtpCapabilities");
                        transport = broadcaster.data.transports.get(transportId);
                        if (!transport)
                            throw new Error("transport with id \"" + transportId + "\" does not exist");
                        return [4 /*yield*/, transport.consume({
                                producerId: producerId,
                                rtpCapabilities: broadcaster.data.rtpCapabilities,
                            })];
                    case 1:
                        consumer = _b.sent();
                        // Store it.
                        broadcaster.data.consumers.set(consumer.id, consumer);
                        // Set Consumer events.
                        consumer.on("transportclose", function () {
                            // Remove from its map.
                            broadcaster.data.consumers.delete(consumer.id);
                        });
                        consumer.on("producerclose", function () {
                            // Remove from its map.
                            broadcaster.data.consumers.delete(consumer.id);
                        });
                        return [2 /*return*/, {
                                id: consumer.id,
                                producerId: producerId,
                                kind: consumer.kind,
                                rtpParameters: consumer.rtpParameters,
                                type: consumer.type,
                            }];
                }
            });
        });
    };
    /**
     * Create a mediasoup DataConsumer associated to a Broadcaster.
     *
     * @async
     *
     * @type {String} broadcasterId
     * @type {String} transportId
     * @type {String} dataProducerId
     */
    Room.prototype.createBroadcasterDataConsumer = function (_a) {
        var broadcasterId = _a.broadcasterId, transportId = _a.transportId, dataProducerId = _a.dataProducerId;
        return __awaiter(this, void 0, void 0, function () {
            var broadcaster, transport, dataConsumer;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        broadcaster = this._broadcasters.get(broadcasterId);
                        if (!broadcaster)
                            throw new Error("broadcaster with id \"" + broadcasterId + "\" does not exist");
                        if (!broadcaster.data.rtpCapabilities)
                            throw new Error("broadcaster does not have rtpCapabilities");
                        transport = broadcaster.data.transports.get(transportId);
                        if (!transport)
                            throw new Error("transport with id \"" + transportId + "\" does not exist");
                        return [4 /*yield*/, transport.consumeData({
                                dataProducerId: dataProducerId,
                            })];
                    case 1:
                        dataConsumer = _b.sent();
                        // Store it.
                        broadcaster.data.dataConsumers.set(dataConsumer.id, dataConsumer);
                        // Set Consumer events.
                        dataConsumer.on("transportclose", function () {
                            // Remove from its map.
                            broadcaster.data.dataConsumers.delete(dataConsumer.id);
                        });
                        dataConsumer.on("dataproducerclose", function () {
                            // Remove from its map.
                            broadcaster.data.dataConsumers.delete(dataConsumer.id);
                        });
                        return [2 /*return*/, {
                                id: dataConsumer.id,
                            }];
                }
            });
        });
    };
    /**
     * Create a mediasoup DataProducer associated to a Broadcaster.
     *
     * @async
     *
     * @type {String} broadcasterId
     * @type {String} transportId
     */
    Room.prototype.createBroadcasterDataProducer = function (_a) {
        var broadcasterId = _a.broadcasterId, transportId = _a.transportId, label = _a.label, protocol = _a.protocol, sctpStreamParameters = _a.sctpStreamParameters, appData = _a.appData;
        return __awaiter(this, void 0, void 0, function () {
            var broadcaster, transport, dataProducer;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        broadcaster = this._broadcasters.get(broadcasterId);
                        if (!broadcaster)
                            throw new Error("broadcaster with id \"" + broadcasterId + "\" does not exist");
                        transport = broadcaster.data.transports.get(transportId);
                        if (!transport)
                            throw new Error("transport with id \"" + transportId + "\" does not exist");
                        return [4 /*yield*/, transport.produceData({
                                sctpStreamParameters: sctpStreamParameters,
                                label: label,
                                protocol: protocol,
                                appData: appData,
                            })];
                    case 1:
                        dataProducer = _b.sent();
                        // Store it.
                        broadcaster.data.dataProducers.set(dataProducer.id, dataProducer);
                        // Set Consumer events.
                        dataProducer.on("transportclose", function () {
                            // Remove from its map.
                            broadcaster.data.dataProducers.delete(dataProducer.id);
                        });
                        // // Optimization: Create a server-side Consumer for each Peer.
                        // for (const peer of this._getJoinedPeers())
                        // {
                        // 	this._createDataConsumer(
                        // 		{
                        // 			dataConsumerPeer : peer,
                        // 			dataProducerPeer : broadcaster,
                        // 			dataProducer: dataProducer
                        // 		});
                        // }
                        return [2 /*return*/, {
                                id: dataProducer.id,
                            }];
                }
            });
        });
    };
    Room.prototype._handleAudioLevelObserver = function () {
        var _this = this;
        this._audioLevelObserver.on("volumes", function (volumes) {
            var _a = volumes[0], producer = _a.producer, volume = _a.volume;
            // l(
            // 	'audioLevelObserver "volumes" event [producerId:%s, volume:%s]',
            // 	producer.id, volume);
            // Notify all Peers.
            for (var _i = 0, _b = _this._getJoinedPeers(); _i < _b.length; _i++) {
                var peer = _b[_i];
                peer.notify("activeSpeaker", {
                    peerId: producer.appData.peerId,
                    volume: volume,
                }).catch(function () { });
            }
        });
        this._audioLevelObserver.on("silence", function () {
            // l('audioLevelObserver "silence" event');
            // Notify all Peers.
            for (var _i = 0, _a = _this._getJoinedPeers(); _i < _a.length; _i++) {
                var peer = _a[_i];
                peer.notify("activeSpeaker", { peerId: null }).catch(function () { });
            }
        });
    };
    /**
     * Handle protoo requests from browsers.
     *
     * @async
     */
    Room.prototype._handleProtooRequest = function (peer, request, accept, reject) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, displayName, device, rtpCapabilities, sctpCapabilities, joinedPeers, peerInfos, _i, joinedPeers_2, joinedPeer, _c, _d, producer, _e, _f, dataProducer, _g, _h, otherPeer, _j, forceTcp, producing, consuming, sctpCapabilities, webRtcTransportOptions, transport_1, maxIncomingBitrate, error_1, _k, transportId, dtlsParameters, transport, transportId, transport, iceParameters, _l, transportId, kind, rtpParameters, appData, transport, producer_1, _m, _o, otherPeer, producerId, producer, producerId, producer, producerId, producer, consumerId, consumer, consumerId, consumer, _p, consumerId, spatialLayer, temporalLayer, consumer, _q, consumerId, priority, consumer, consumerId, consumer, _r, transportId, sctpStreamParameters, label, protocol, appData, transport, dataProducer, _s, _t, otherPeer, displayName, oldDisplayName, _u, _v, otherPeer, transportId, transport, stats, producerId, producer, stats, consumerId, consumer, stats, dataProducerId, dataProducer, stats, dataConsumerId, dataConsumer, stats, DefaultUplink, DefaultDownlink, DefaultRtt, _w, uplink, downlink, rtt, secret, error_2, secret, error_3;
            return __generator(this, function (_x) {
                switch (_x.label) {
                    case 0:
                        _a = request.method;
                        switch (_a) {
                            case "getRouterRtpCapabilities": return [3 /*break*/, 1];
                            case "join": return [3 /*break*/, 2];
                            case "createWebRtcTransport": return [3 /*break*/, 3];
                            case "connectWebRtcTransport": return [3 /*break*/, 10];
                            case "restartIce": return [3 /*break*/, 12];
                            case "produce": return [3 /*break*/, 14];
                            case "closeProducer": return [3 /*break*/, 16];
                            case "pauseProducer": return [3 /*break*/, 17];
                            case "resumeProducer": return [3 /*break*/, 19];
                            case "pauseConsumer": return [3 /*break*/, 21];
                            case "resumeConsumer": return [3 /*break*/, 23];
                            case "setConsumerPreferredLayers": return [3 /*break*/, 25];
                            case "setConsumerPriority": return [3 /*break*/, 27];
                            case "requestConsumerKeyFrame": return [3 /*break*/, 29];
                            case "produceData": return [3 /*break*/, 31];
                            case "changeDisplayName": return [3 /*break*/, 33];
                            case "getTransportStats": return [3 /*break*/, 34];
                            case "getProducerStats": return [3 /*break*/, 36];
                            case "getConsumerStats": return [3 /*break*/, 38];
                            case "getDataProducerStats": return [3 /*break*/, 40];
                            case "getDataConsumerStats": return [3 /*break*/, 42];
                            case "applyNetworkThrottle": return [3 /*break*/, 44];
                            case "resetNetworkThrottle": return [3 /*break*/, 49];
                        }
                        return [3 /*break*/, 54];
                    case 1:
                        {
                            (0, logger_1.default)("getRouterRtpCapabilities");
                            accept(this._mediasoupRouter.rtpCapabilities);
                            return [3 /*break*/, 55];
                        }
                        _x.label = 2;
                    case 2:
                        {
                            // Ensure the Peer is not already joined.
                            if (peer.data.joined)
                                throw new Error("Peer already joined");
                            _b = request.data, displayName = _b.displayName, device = _b.device, rtpCapabilities = _b.rtpCapabilities, sctpCapabilities = _b.sctpCapabilities;
                            // Store client data into the protoo Peer data object.
                            peer.data.joined = true;
                            peer.data.displayName = displayName;
                            peer.data.device = device;
                            peer.data.rtpCapabilities = rtpCapabilities;
                            peer.data.sctpCapabilities = sctpCapabilities;
                            joinedPeers = __spreadArray(__spreadArray([], this._getJoinedPeers(), true), this._broadcasters.values(), true);
                            peerInfos = joinedPeers
                                .filter(function (joinedPeer) { return joinedPeer.id !== peer.id; })
                                .map(function (joinedPeer) { return ({
                                id: joinedPeer.id,
                                displayName: joinedPeer.data.displayName,
                                device: joinedPeer.data.device,
                            }); });
                            accept({ peers: peerInfos });
                            // Mark the new Peer as joined.
                            peer.data.joined = true;
                            for (_i = 0, joinedPeers_2 = joinedPeers; _i < joinedPeers_2.length; _i++) {
                                joinedPeer = joinedPeers_2[_i];
                                // Create Consumers for existing Producers.
                                for (_c = 0, _d = joinedPeer.data.producers.values(); _c < _d.length; _c++) {
                                    producer = _d[_c];
                                    this._createConsumer({
                                        consumerPeer: peer,
                                        producerPeer: joinedPeer,
                                        producer: producer,
                                    });
                                }
                                // Create DataConsumers for existing DataProducers.
                                for (_e = 0, _f = joinedPeer.data.dataProducers.values(); _e < _f.length; _e++) {
                                    dataProducer = _f[_e];
                                    if (dataProducer.label === "bot")
                                        continue;
                                    this._createDataConsumer({
                                        dataConsumerPeer: peer,
                                        dataProducerPeer: joinedPeer,
                                        dataProducer: dataProducer,
                                    });
                                }
                            }
                            // Create DataConsumers for bot DataProducer.
                            this._createDataConsumer({
                                dataConsumerPeer: peer,
                                dataProducerPeer: null,
                                dataProducer: this._bot.dataProducer,
                            });
                            // Notify the new Peer to all other Peers.
                            for (_g = 0, _h = this._getJoinedPeers({ excludePeer: peer }); _g < _h.length; _g++) {
                                otherPeer = _h[_g];
                                otherPeer
                                    .notify("newPeer", {
                                    id: peer.id,
                                    displayName: peer.data.displayName,
                                    device: peer.data.device,
                                })
                                    .catch(function () { });
                            }
                            return [3 /*break*/, 55];
                        }
                        _x.label = 3;
                    case 3:
                        _j = request.data, forceTcp = _j.forceTcp, producing = _j.producing, consuming = _j.consuming, sctpCapabilities = _j.sctpCapabilities;
                        webRtcTransportOptions = __assign(__assign({}, config.mediasoup.webRtcTransportOptions), { enableSctp: Boolean(sctpCapabilities), numSctpStreams: (sctpCapabilities || {}).numStreams, appData: { producing: producing, consuming: consuming } });
                        if (forceTcp) {
                            webRtcTransportOptions.enableUdp = false;
                            webRtcTransportOptions.enableTcp = true;
                        }
                        return [4 /*yield*/, this._mediasoupRouter.createWebRtcTransport(webRtcTransportOptions)];
                    case 4:
                        transport_1 = _x.sent();
                        transport_1.on("sctpstatechange", function (sctpState) {
                            (0, logger_1.default)('WebRtcTransport "sctpstatechange" event [sctpState:%s]', sctpState);
                        });
                        transport_1.on("dtlsstatechange", function (dtlsState) {
                            if (dtlsState === "failed" || dtlsState === "closed")
                                (0, logger_1.warn)('WebRtcTransport "dtlsstatechange" event [dtlsState:%s]', dtlsState);
                        });
                        // NOTE: For testing.
                        // await transport.enableTraceEvent([ 'probation', 'bwe' ]);
                        return [4 /*yield*/, transport_1.enableTraceEvent(["bwe"])];
                    case 5:
                        // NOTE: For testing.
                        // await transport.enableTraceEvent([ 'probation', 'bwe' ]);
                        _x.sent();
                        transport_1.on("trace", function (trace) {
                            (0, logger_1.default)('transport "trace" event [transportId:%s, trace.type:%s, trace:%o]', transport_1.id, trace.type, trace);
                            if (trace.type === "bwe" && trace.direction === "out") {
                                peer.notify("downlinkBwe", {
                                    desiredBitrate: trace.info.desiredBitrate,
                                    effectiveDesiredBitrate: trace.info.effectiveDesiredBitrate,
                                    availableBitrate: trace.info.availableBitrate,
                                }).catch(function () { });
                            }
                        });
                        // Store the WebRtcTransport into the protoo Peer data Object.
                        peer.data.transports.set(transport_1.id, transport_1);
                        accept({
                            id: transport_1.id,
                            iceParameters: transport_1.iceParameters,
                            iceCandidates: transport_1.iceCandidates,
                            dtlsParameters: transport_1.dtlsParameters,
                            sctpParameters: transport_1.sctpParameters,
                        });
                        maxIncomingBitrate = config.mediasoup.webRtcTransportOptions.maxIncomingBitrate;
                        if (!maxIncomingBitrate) return [3 /*break*/, 9];
                        _x.label = 6;
                    case 6:
                        _x.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, transport_1.setMaxIncomingBitrate(maxIncomingBitrate)];
                    case 7:
                        _x.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        error_1 = _x.sent();
                        return [3 /*break*/, 9];
                    case 9: return [3 /*break*/, 55];
                    case 10:
                        _k = request.data, transportId = _k.transportId, dtlsParameters = _k.dtlsParameters;
                        transport = peer.data.transports.get(transportId);
                        if (!transport)
                            throw new Error("transport with id \"" + transportId + "\" not found");
                        return [4 /*yield*/, transport.connect({ dtlsParameters: dtlsParameters })];
                    case 11:
                        _x.sent();
                        accept();
                        return [3 /*break*/, 55];
                    case 12:
                        transportId = request.data.transportId;
                        transport = peer.data.transports.get(transportId);
                        if (!transport)
                            throw new Error("transport with id \"" + transportId + "\" not found");
                        return [4 /*yield*/, transport.restartIce()];
                    case 13:
                        iceParameters = _x.sent();
                        accept(iceParameters);
                        return [3 /*break*/, 55];
                    case 14:
                        // Ensure the Peer is joined.
                        if (!peer.data.joined)
                            throw new Error("Peer not yet joined");
                        _l = request.data, transportId = _l.transportId, kind = _l.kind, rtpParameters = _l.rtpParameters;
                        appData = request.data.appData;
                        transport = peer.data.transports.get(transportId);
                        if (!transport)
                            throw new Error("transport with id \"" + transportId + "\" not found");
                        // Add peerId into appData to later get the associated Peer during
                        // the 'loudest' event of the audioLevelObserver.
                        appData = __assign(__assign({}, appData), { peerId: peer.id });
                        return [4 /*yield*/, transport.produce({
                                kind: kind,
                                rtpParameters: rtpParameters,
                                appData: appData,
                                // keyFrameRequestDelay: 5000
                            })];
                    case 15:
                        producer_1 = _x.sent();
                        // Store the Producer into the protoo Peer data Object.
                        peer.data.producers.set(producer_1.id, producer_1);
                        // Set Producer events.
                        producer_1.on("score", function (score) {
                            // l(
                            // 	'producer "score" event [producerId:%s, score:%o]',
                            // 	producer.id, score);
                            peer.notify("producerScore", { producerId: producer_1.id, score: score }).catch(function () { });
                        });
                        producer_1.on("videoorientationchange", function (videoOrientation) {
                            (0, logger_1.default)('producer "videoorientationchange" event [producerId:%s, videoOrientation:%o]', producer_1.id, videoOrientation);
                        });
                        // NOTE: For testing.
                        // await producer.enableTraceEvent([ 'rtp', 'keyframe', 'nack', 'pli', 'fir' ]);
                        // await producer.enableTraceEvent([ 'pli', 'fir' ]);
                        // await producer.enableTraceEvent([ 'keyframe' ]);
                        producer_1.on("trace", function (trace) {
                            (0, logger_1.default)('producer "trace" event [producerId:%s, trace.type:%s, trace:%o]', producer_1.id, trace.type, trace);
                        });
                        accept({ id: producer_1.id });
                        // Optimization: Create a server-side Consumer for each Peer.
                        for (_m = 0, _o = this._getJoinedPeers({ excludePeer: peer }); _m < _o.length; _m++) {
                            otherPeer = _o[_m];
                            this._createConsumer({
                                consumerPeer: otherPeer,
                                producerPeer: peer,
                                producer: producer_1,
                            });
                        }
                        // Add into the audioLevelObserver.
                        if (producer_1.kind === "audio") {
                            this._audioLevelObserver
                                .addProducer({ producerId: producer_1.id })
                                .catch(function () { });
                        }
                        return [3 /*break*/, 55];
                    case 16:
                        {
                            // Ensure the Peer is joined.
                            if (!peer.data.joined)
                                throw new Error("Peer not yet joined");
                            producerId = request.data.producerId;
                            producer = peer.data.producers.get(producerId);
                            if (!producer)
                                throw new Error("producer with id \"" + producerId + "\" not found");
                            producer.close();
                            // Remove from its map.
                            peer.data.producers.delete(producer.id);
                            accept();
                            return [3 /*break*/, 55];
                        }
                        _x.label = 17;
                    case 17:
                        // Ensure the Peer is joined.
                        if (!peer.data.joined)
                            throw new Error("Peer not yet joined");
                        producerId = request.data.producerId;
                        producer = peer.data.producers.get(producerId);
                        if (!producer)
                            throw new Error("producer with id \"" + producerId + "\" not found");
                        return [4 /*yield*/, producer.pause()];
                    case 18:
                        _x.sent();
                        accept();
                        return [3 /*break*/, 55];
                    case 19:
                        // Ensure the Peer is joined.
                        if (!peer.data.joined)
                            throw new Error("Peer not yet joined");
                        producerId = request.data.producerId;
                        producer = peer.data.producers.get(producerId);
                        if (!producer)
                            throw new Error("producer with id \"" + producerId + "\" not found");
                        return [4 /*yield*/, producer.resume()];
                    case 20:
                        _x.sent();
                        accept();
                        return [3 /*break*/, 55];
                    case 21:
                        // Ensure the Peer is joined.
                        if (!peer.data.joined)
                            throw new Error("Peer not yet joined");
                        consumerId = request.data.consumerId;
                        consumer = peer.data.consumers.get(consumerId);
                        if (!consumer)
                            throw new Error("consumer with id \"" + consumerId + "\" not found");
                        return [4 /*yield*/, consumer.pause()];
                    case 22:
                        _x.sent();
                        accept();
                        return [3 /*break*/, 55];
                    case 23:
                        // Ensure the Peer is joined.
                        if (!peer.data.joined)
                            throw new Error("Peer not yet joined");
                        consumerId = request.data.consumerId;
                        consumer = peer.data.consumers.get(consumerId);
                        if (!consumer)
                            throw new Error("consumer with id \"" + consumerId + "\" not found");
                        return [4 /*yield*/, consumer.resume()];
                    case 24:
                        _x.sent();
                        accept();
                        return [3 /*break*/, 55];
                    case 25:
                        // Ensure the Peer is joined.
                        if (!peer.data.joined)
                            throw new Error("Peer not yet joined");
                        _p = request.data, consumerId = _p.consumerId, spatialLayer = _p.spatialLayer, temporalLayer = _p.temporalLayer;
                        consumer = peer.data.consumers.get(consumerId);
                        if (!consumer)
                            throw new Error("consumer with id \"" + consumerId + "\" not found");
                        return [4 /*yield*/, consumer.setPreferredLayers({ spatialLayer: spatialLayer, temporalLayer: temporalLayer })];
                    case 26:
                        _x.sent();
                        accept();
                        return [3 /*break*/, 55];
                    case 27:
                        // Ensure the Peer is joined.
                        if (!peer.data.joined)
                            throw new Error("Peer not yet joined");
                        _q = request.data, consumerId = _q.consumerId, priority = _q.priority;
                        consumer = peer.data.consumers.get(consumerId);
                        if (!consumer)
                            throw new Error("consumer with id \"" + consumerId + "\" not found");
                        return [4 /*yield*/, consumer.setPriority(priority)];
                    case 28:
                        _x.sent();
                        accept();
                        return [3 /*break*/, 55];
                    case 29:
                        // Ensure the Peer is joined.
                        if (!peer.data.joined)
                            throw new Error("Peer not yet joined");
                        consumerId = request.data.consumerId;
                        consumer = peer.data.consumers.get(consumerId);
                        if (!consumer)
                            throw new Error("consumer with id \"" + consumerId + "\" not found");
                        return [4 /*yield*/, consumer.requestKeyFrame()];
                    case 30:
                        _x.sent();
                        accept();
                        return [3 /*break*/, 55];
                    case 31:
                        // Ensure the Peer is joined.
                        if (!peer.data.joined)
                            throw new Error("Peer not yet joined");
                        _r = request.data, transportId = _r.transportId, sctpStreamParameters = _r.sctpStreamParameters, label = _r.label, protocol = _r.protocol, appData = _r.appData;
                        transport = peer.data.transports.get(transportId);
                        if (!transport)
                            throw new Error("transport with id \"" + transportId + "\" not found");
                        return [4 /*yield*/, transport.produceData({
                                sctpStreamParameters: sctpStreamParameters,
                                label: label,
                                protocol: protocol,
                                appData: appData,
                            })];
                    case 32:
                        dataProducer = _x.sent();
                        // Store the Producer into the protoo Peer data Object.
                        peer.data.dataProducers.set(dataProducer.id, dataProducer);
                        accept({ id: dataProducer.id });
                        switch (dataProducer.label) {
                            case "chat": {
                                // Create a server-side DataConsumer for each Peer.
                                for (_s = 0, _t = this._getJoinedPeers({ excludePeer: peer }); _s < _t.length; _s++) {
                                    otherPeer = _t[_s];
                                    this._createDataConsumer({
                                        dataConsumerPeer: otherPeer,
                                        dataProducerPeer: peer,
                                        dataProducer: dataProducer,
                                    });
                                }
                                break;
                            }
                            case "bot": {
                                // Pass it to the bot.
                                this._bot.handlePeerDataProducer({
                                    dataProducerId: dataProducer.id,
                                    peer: peer,
                                });
                                break;
                            }
                        }
                        return [3 /*break*/, 55];
                    case 33:
                        {
                            // Ensure the Peer is joined.
                            if (!peer.data.joined)
                                throw new Error("Peer not yet joined");
                            displayName = request.data.displayName;
                            oldDisplayName = peer.data.displayName;
                            // Store the display name into the custom data Object of the protoo
                            // Peer.
                            peer.data.displayName = displayName;
                            // Notify other joined Peers.
                            for (_u = 0, _v = this._getJoinedPeers({ excludePeer: peer }); _u < _v.length; _u++) {
                                otherPeer = _v[_u];
                                otherPeer
                                    .notify("peerDisplayNameChanged", {
                                    peerId: peer.id,
                                    displayName: displayName,
                                    oldDisplayName: oldDisplayName,
                                })
                                    .catch(function () { });
                            }
                            accept();
                            return [3 /*break*/, 55];
                        }
                        _x.label = 34;
                    case 34:
                        transportId = request.data.transportId;
                        transport = peer.data.transports.get(transportId);
                        if (!transport)
                            throw new Error("transport with id \"" + transportId + "\" not found");
                        return [4 /*yield*/, transport.getStats()];
                    case 35:
                        stats = _x.sent();
                        accept(stats);
                        return [3 /*break*/, 55];
                    case 36:
                        producerId = request.data.producerId;
                        producer = peer.data.producers.get(producerId);
                        if (!producer)
                            throw new Error("producer with id \"" + producerId + "\" not found");
                        return [4 /*yield*/, producer.getStats()];
                    case 37:
                        stats = _x.sent();
                        accept(stats);
                        return [3 /*break*/, 55];
                    case 38:
                        consumerId = request.data.consumerId;
                        consumer = peer.data.consumers.get(consumerId);
                        if (!consumer)
                            throw new Error("consumer with id \"" + consumerId + "\" not found");
                        return [4 /*yield*/, consumer.getStats()];
                    case 39:
                        stats = _x.sent();
                        accept(stats);
                        return [3 /*break*/, 55];
                    case 40:
                        dataProducerId = request.data.dataProducerId;
                        dataProducer = peer.data.dataProducers.get(dataProducerId);
                        if (!dataProducer)
                            throw new Error("dataProducer with id \"" + dataProducerId + "\" not found");
                        return [4 /*yield*/, dataProducer.getStats()];
                    case 41:
                        stats = _x.sent();
                        accept(stats);
                        return [3 /*break*/, 55];
                    case 42:
                        dataConsumerId = request.data.dataConsumerId;
                        dataConsumer = peer.data.dataConsumers.get(dataConsumerId);
                        if (!dataConsumer)
                            throw new Error("dataConsumer with id \"" + dataConsumerId + "\" not found");
                        return [4 /*yield*/, dataConsumer.getStats()];
                    case 43:
                        stats = _x.sent();
                        accept(stats);
                        return [3 /*break*/, 55];
                    case 44:
                        DefaultUplink = 1000000;
                        DefaultDownlink = 1000000;
                        DefaultRtt = 0;
                        _w = request.data, uplink = _w.uplink, downlink = _w.downlink, rtt = _w.rtt, secret = _w.secret;
                        if (!secret || secret !== process.env.NETWORK_THROTTLE_SECRET) {
                            reject(403, "operation NOT allowed, modda fuckaa");
                            return [2 /*return*/];
                        }
                        _x.label = 45;
                    case 45:
                        _x.trys.push([45, 47, , 48]);
                        return [4 /*yield*/, throttle.start({
                                up: uplink || DefaultUplink,
                                down: downlink || DefaultDownlink,
                                rtt: rtt || DefaultRtt,
                            })];
                    case 46:
                        _x.sent();
                        (0, logger_1.warn)("network throttle set [uplink:%s, downlink:%s, rtt:%s]", uplink || DefaultUplink, downlink || DefaultDownlink, rtt || DefaultRtt);
                        accept();
                        return [3 /*break*/, 48];
                    case 47:
                        error_2 = _x.sent();
                        (0, logger_1.error)("network throttle apply failed: %o", error_2);
                        reject(500, error_2.toString());
                        return [3 /*break*/, 48];
                    case 48: return [3 /*break*/, 55];
                    case 49:
                        secret = request.data.secret;
                        if (!secret || secret !== process.env.NETWORK_THROTTLE_SECRET) {
                            reject(403, "operation NOT allowed, modda fuckaa");
                            return [2 /*return*/];
                        }
                        _x.label = 50;
                    case 50:
                        _x.trys.push([50, 52, , 53]);
                        return [4 /*yield*/, throttle.stop({})];
                    case 51:
                        _x.sent();
                        (0, logger_1.warn)("network throttle stopped");
                        accept();
                        return [3 /*break*/, 53];
                    case 52:
                        error_3 = _x.sent();
                        (0, logger_1.error)("network throttle stop failed: %o", error_3);
                        reject(500, error_3.toString());
                        return [3 /*break*/, 53];
                    case 53: return [3 /*break*/, 55];
                    case 54:
                        {
                            (0, logger_1.error)('unknown request.method "%s"', request.method);
                            reject(500, "unknown request.method \"" + request.method + "\"");
                        }
                        _x.label = 55;
                    case 55: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Helper to get the list of joined protoo peers.
     */
    Room.prototype._getJoinedPeers = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.excludePeer, excludePeer = _c === void 0 ? undefined : _c;
        return this._protooRoom.peers.filter(function (peer) { return peer.data.joined && peer !== excludePeer; });
    };
    /**
     * Creates a mediasoup Consumer for the given mediasoup Producer.
     *
     * @async
     */
    Room.prototype._createConsumer = function (_a) {
        var consumerPeer = _a.consumerPeer, producerPeer = _a.producerPeer, producer = _a.producer;
        return __awaiter(this, void 0, void 0, function () {
            var transport, consumer, error_4, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Optimization:
                        // - Create the server-side Consumer in paused mode.
                        // - Tell its Peer about it and wait for its response.
                        // - Upon receipt of the response, resume the server-side Consumer.
                        // - If video, this will mean a single key frame requested by the
                        //   server-side Consumer (when resuming it).
                        // - If audio (or video), it will avoid that RTP packets are received by the
                        //   remote endpoint *before* the Consumer is locally created in the endpoint
                        //   (and before the local SDP O/A procedure ends). If that happens (RTP
                        //   packets are received before the SDP O/A is done) the PeerConnection may
                        //   fail to associate the RTP stream.
                        // NOTE: Don't create the Consumer if the remote Peer cannot consume it.
                        if (!consumerPeer.data.rtpCapabilities ||
                            !this._mediasoupRouter.canConsume({
                                producerId: producer.id,
                                rtpCapabilities: consumerPeer.data.rtpCapabilities,
                            })) {
                            return [2 /*return*/];
                        }
                        transport = Array.from(consumerPeer.data.transports.values()).find(function (t) { return t.appData.consuming; });
                        // This should not happen.
                        if (!transport) {
                            (0, logger_1.warn)("_createConsumer() | Transport for consuming not found");
                            return [2 /*return*/];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, transport.consume({
                                producerId: producer.id,
                                rtpCapabilities: consumerPeer.data.rtpCapabilities,
                                paused: true,
                            })];
                    case 2:
                        consumer = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _b.sent();
                        (0, logger_1.warn)("_createConsumer() | transport.consume():%o", error_4);
                        return [2 /*return*/];
                    case 4:
                        // Store the Consumer into the protoo consumerPeer data Object.
                        consumerPeer.data.consumers.set(consumer.id, consumer);
                        // Set Consumer events.
                        consumer.on("transportclose", function () {
                            // Remove from its map.
                            consumerPeer.data.consumers.delete(consumer.id);
                        });
                        consumer.on("producerclose", function () {
                            // Remove from its map.
                            consumerPeer.data.consumers.delete(consumer.id);
                            consumerPeer.notify("consumerClosed", { consumerId: consumer.id }).catch(function () { });
                        });
                        consumer.on("producerpause", function () {
                            consumerPeer.notify("consumerPaused", { consumerId: consumer.id }).catch(function () { });
                        });
                        consumer.on("producerresume", function () {
                            consumerPeer.notify("consumerResumed", { consumerId: consumer.id }).catch(function () { });
                        });
                        consumer.on("score", function (score) {
                            // l(
                            // 	'consumer "score" event [consumerId:%s, score:%o]',
                            // 	consumer.id, score);
                            consumerPeer
                                .notify("consumerScore", { consumerId: consumer.id, score: score })
                                .catch(function () { });
                        });
                        consumer.on("layerschange", function (layers) {
                            consumerPeer
                                .notify("consumerLayersChanged", {
                                consumerId: consumer.id,
                                spatialLayer: layers ? layers.spatialLayer : null,
                                temporalLayer: layers ? layers.temporalLayer : null,
                            })
                                .catch(function () { });
                        });
                        // NOTE: For testing.
                        // await consumer.enableTraceEvent([ 'rtp', 'keyframe', 'nack', 'pli', 'fir' ]);
                        // await consumer.enableTraceEvent([ 'pli', 'fir' ]);
                        // await consumer.enableTraceEvent([ 'keyframe' ]);
                        consumer.on("trace", function (trace) {
                            (0, logger_1.default)('consumer "trace" event [producerId:%s, trace.type:%s, trace:%o]', consumer.id, trace.type, trace);
                        });
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 8, , 9]);
                        return [4 /*yield*/, consumerPeer.request("newConsumer", {
                                peerId: producerPeer.id,
                                producerId: producer.id,
                                id: consumer.id,
                                kind: consumer.kind,
                                rtpParameters: consumer.rtpParameters,
                                type: consumer.type,
                                appData: producer.appData,
                                producerPaused: consumer.producerPaused,
                            })];
                    case 6:
                        _b.sent();
                        // Now that we got the positive response from the remote endpoint, resume
                        // the Consumer so the remote endpoint will receive the a first RTP packet
                        // of this new stream once its PeerConnection is already ready to process
                        // and associate it.
                        return [4 /*yield*/, consumer.resume()];
                    case 7:
                        // Now that we got the positive response from the remote endpoint, resume
                        // the Consumer so the remote endpoint will receive the a first RTP packet
                        // of this new stream once its PeerConnection is already ready to process
                        // and associate it.
                        _b.sent();
                        consumerPeer
                            .notify("consumerScore", {
                            consumerId: consumer.id,
                            score: consumer.score,
                        })
                            .catch(function () { });
                        return [3 /*break*/, 9];
                    case 8:
                        error_5 = _b.sent();
                        (0, logger_1.warn)("_createConsumer() | failed:%o", error_5);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a mediasoup DataConsumer for the given mediasoup DataProducer.
     *
     * @async
     */
    Room.prototype._createDataConsumer = function (_a) {
        var dataConsumerPeer = _a.dataConsumerPeer, _b = _a.dataProducerPeer, dataProducerPeer = _b === void 0 ? null : _b, // This is null for the bot DataProducer.
        dataProducer = _a.dataProducer;
        return __awaiter(this, void 0, void 0, function () {
            var transport, dataConsumer, error_6, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // NOTE: Don't create the DataConsumer if the remote Peer cannot consume it.
                        if (!dataConsumerPeer.data.sctpCapabilities)
                            return [2 /*return*/];
                        transport = Array.from(dataConsumerPeer.data.transports.values()).find(function (t) { return t.appData.consuming; });
                        // This should not happen.
                        if (!transport) {
                            (0, logger_1.warn)("_createDataConsumer() | Transport for consuming not found");
                            return [2 /*return*/];
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, transport.consumeData({
                                dataProducerId: dataProducer.id,
                            })];
                    case 2:
                        dataConsumer = _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _c.sent();
                        (0, logger_1.warn)("_createDataConsumer() | transport.consumeData():%o", error_6);
                        return [2 /*return*/];
                    case 4:
                        // Store the DataConsumer into the protoo dataConsumerPeer data Object.
                        dataConsumerPeer.data.dataConsumers.set(dataConsumer.id, dataConsumer);
                        // Set DataConsumer events.
                        dataConsumer.on("transportclose", function () {
                            // Remove from its map.
                            dataConsumerPeer.data.dataConsumers.delete(dataConsumer.id);
                        });
                        dataConsumer.on("dataproducerclose", function () {
                            // Remove from its map.
                            dataConsumerPeer.data.dataConsumers.delete(dataConsumer.id);
                            dataConsumerPeer
                                .notify("dataConsumerClosed", { dataConsumerId: dataConsumer.id })
                                .catch(function () { });
                        });
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, dataConsumerPeer.request("newDataConsumer", {
                                // This is null for bot DataProducer.
                                peerId: dataProducerPeer ? dataProducerPeer.id : null,
                                dataProducerId: dataProducer.id,
                                id: dataConsumer.id,
                                sctpStreamParameters: dataConsumer.sctpStreamParameters,
                                label: dataConsumer.label,
                                protocol: dataConsumer.protocol,
                                appData: dataProducer.appData,
                            })];
                    case 6:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_7 = _c.sent();
                        (0, logger_1.warn)("_createDataConsumer() | failed:%o", error_7);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return Room;
}(EventEmitter));
exports.default = Room;
//# sourceMappingURL=Room.js.map