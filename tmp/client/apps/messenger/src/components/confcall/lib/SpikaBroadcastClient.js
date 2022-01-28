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
exports.getMicrophones = exports.getCameras = void 0;
var protoo_client_1 = __importDefault(require("protoo-client"));
var mediasoupClient = __importStar(require("mediasoup-client"));
var Logger_1 = require("./Logger");
var deviceInfo_1 = __importDefault(require("./deviceInfo"));
var e2e = __importStar(require("./e2e"));
var Utils_1 = __importDefault(require("../lib/Utils"));
var PC_PROPRIETARY_CONSTRAINTS = {
    optional: [{ googDscp: true }],
};
var VIDEO_CONSTRAINS = {
    qvga: { width: { ideal: 320 }, height: { ideal: 240 } },
    vga: { width: { ideal: 640 }, height: { ideal: 480 } },
    hd: { width: { ideal: 1280 }, height: { ideal: 720 } },
};
// Used for VP9 webcam video.
var WEBCAM_KSVC_ENCODINGS = [{ scalabilityMode: "S3T3_KEY" }];
// Used for simulcast screen sharing.
var SCREEN_SHARING_SIMULCAST_ENCODINGS = [
    { dtx: true, maxBitrate: 1500000 },
    { dtx: true, maxBitrate: 6000000 },
];
// Used for simulcast webcam video.
var WEBCAM_SIMULCAST_ENCODINGS = [
    { scaleResolutionDownBy: 4, maxBitrate: 500000 },
    { scaleResolutionDownBy: 2, maxBitrate: 1000000 },
    { scaleResolutionDownBy: 1, maxBitrate: 5000000 },
];
var EXTERNAL_VIDEO_SRC = "https://mediasouptest.clover.studio/resources/videos/video-audio-stereo.mp4";
function getCameras() {
    return __awaiter(this, void 0, void 0, function () {
        var devices;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                case 1:
                    devices = _a.sent();
                    return [2 /*return*/, devices.filter(function (device) { return device.kind == "videoinput"; })];
            }
        });
    });
}
exports.getCameras = getCameras;
function getMicrophones() {
    return __awaiter(this, void 0, void 0, function () {
        var devices;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                case 1:
                    devices = _a.sent();
                    return [2 /*return*/, devices.filter(function (device) { return device.kind == "audioinput"; })];
            }
        });
    });
}
exports.getMicrophones = getMicrophones;
var SpikaBroadcastClient = /** @class */ (function () {
    // constructor
    function SpikaBroadcastClient(_a) {
        var debug = _a.debug, host = _a.host, port = _a.port, roomId = _a.roomId, peerId = _a.peerId, listener = _a.listener, displayName = _a.displayName, avatarUrl = _a.avatarUrl, defaultCamera = _a.defaultCamera, defaultMicrophone = _a.defaultMicrophone, enableCamera = _a.enableCamera, enableMicrophone = _a.enableMicrophone;
        this.e2eKey = null;
        this.displayName = "";
        this.browser = (0, deviceInfo_1.default)();
        this.micProducer = null;
        this.webcamProducer = null;
        this.shareProducer = null;
        this.webcams = null;
        this.webcam = {
            device: null,
            resolution: "hd",
        };
        this.microphone = null;
        this.forceH264 = false;
        this.forceVP9 = false;
        this.consumers = new Map();
        this.socketUrl = "ws://" + host + ":" + port + "/?roomId=" + roomId + "&peerId=" + peerId;
        this.logger = new Logger_1.Logger("SpikaBroadcast", debug);
        this.logger.addListener(listener.onLogging);
        this.logger.debug("SocketUrl: " + this.socketUrl);
        this.listeners = listener;
        this.participants = new Map();
        this.cameraEnabled = enableCamera;
        this.micEnabled = enableMicrophone;
        this.screenShareEnabled = false;
        this.displayName = displayName;
        this.webcam.device = defaultCamera;
        this.microphone = defaultMicrophone;
    }
    SpikaBroadcastClient.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var protooTransport;
            var _this = this;
            return __generator(this, function (_a) {
                protooTransport = new protoo_client_1.default.WebSocketTransport(this.socketUrl);
                this.protoo = new protoo_client_1.default.Peer(protooTransport);
                this.logger.debug("SpikaBroadcast constructor called");
                this.protoo.on("open", function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        this.logger.debug("Protoo opened");
                        this._join();
                        return [2 /*return*/];
                    });
                }); });
                this.protoo.on("failed", function () {
                    _this.logger.error("Protoo connection error");
                });
                this.protoo.on("disconnected", function () {
                    _this.logger.debug("Protoo disconnected");
                    // Close mediasoup Transports.
                    if (_this.sendTransport) {
                        _this.sendTransport.close();
                        _this.sendTransport = null;
                    }
                    if (_this.recvTransport) {
                        _this.recvTransport.close();
                        _this.recvTransport = null;
                    }
                });
                this.protoo.on("close", function () {
                    _this.logger.debug("Protoo closed");
                });
                this.protoo.on("request", function (request, accept, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var _a, _b, peerId, producerId, id, kind, rtpParameters, type, appData, producerPaused, consumer_1, _c, spatialLayers, temporalLayers, participant, error_1;
                    var _this = this;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                this.logger.debug("Protoo request: " + request.method);
                                _a = request.method;
                                switch (_a) {
                                    case "newConsumer": return [3 /*break*/, 1];
                                    case "newDataConsumer": return [3 /*break*/, 6];
                                }
                                return [3 /*break*/, 7];
                            case 1:
                                _b = request.data, peerId = _b.peerId, producerId = _b.producerId, id = _b.id, kind = _b.kind, rtpParameters = _b.rtpParameters, type = _b.type, appData = _b.appData, producerPaused = _b.producerPaused;
                                _d.label = 2;
                            case 2:
                                _d.trys.push([2, 4, , 5]);
                                return [4 /*yield*/, this.recvTransport.consume({
                                        id: id,
                                        producerId: producerId,
                                        kind: kind,
                                        rtpParameters: rtpParameters,
                                        appData: __assign(__assign({}, appData), { peerId: peerId }), // Trick.
                                    })];
                            case 3:
                                consumer_1 = _d.sent();
                                if (this.e2eKey && e2e.isSupported()) {
                                    e2e.setupReceiverTransform(consumer_1.rtpReceiver);
                                }
                                this.logger.debug("webcamProducer " + consumer_1.id);
                                // Store in the map.
                                this.consumers.set(consumer_1.id, consumer_1);
                                consumer_1.on("transportclose", function () {
                                    var participant = _this.participants.get(consumer_1.appData.peerId);
                                    if (participant)
                                        participant.consumers = participant.consumers.filter(function (c) { return c.id !== consumer_1.id; });
                                });
                                _c = mediasoupClient.parseScalabilityMode(consumer_1.rtpParameters.encodings[0].scalabilityMode), spatialLayers = _c.spatialLayers, temporalLayers = _c.temporalLayers;
                                participant = this.participants.get(consumer_1.appData.peerId);
                                if (participant)
                                    participant.consumers.push(consumer_1);
                                if (participant)
                                    participant.consumerVideoLayerType.set(consumer_1.id, type);
                                if (this.listeners.onParticipantUpdate)
                                    this.listeners.onParticipantUpdate(this.participants);
                                // We are ready. Answer the protoo request so the server will
                                // resume this Consumer (which was paused for now if video).
                                accept();
                                return [3 /*break*/, 5];
                            case 4:
                                error_1 = _d.sent();
                                this.logger.error("newConsumer request failed");
                                throw error_1;
                            case 5: return [3 /*break*/, 7];
                            case 6:
                                {
                                    return [3 /*break*/, 7];
                                }
                                _d.label = 7;
                            case 7: return [2 /*return*/];
                        }
                    });
                }); });
                this.protoo.on("notification", function (notification) {
                    _this.logger.debug("Protoo notification: " + notification.method);
                    switch (notification.method) {
                        case "producerScore": {
                            break;
                        }
                        case "newPeer": {
                            var peer = notification.data;
                            _this.participants.set(peer.id, {
                                id: peer.id,
                                displayName: peer.displayName,
                                peer: peer,
                                consumers: [],
                                consumerVideoLayerType: new Map(),
                                consumerSpatialCurrentLayers: new Map(),
                                consumerTemporalCurrentLayers: new Map(),
                                activeSpeaker: false,
                            });
                            if (_this.listeners.onParticipantUpdate)
                                _this.listeners.onParticipantUpdate(_this.participants);
                            break;
                        }
                        case "peerClosed": {
                            var peerId = notification.data.peerId;
                            _this.participants.delete(peerId);
                            _this.logger.debug("peer closed " + peerId);
                            if (_this.listeners.onParticipantUpdate)
                                _this.listeners.onParticipantUpdate(_this.participants);
                            break;
                        }
                        case "peerDisplayNameChanged": {
                            var _a = notification.data, peerId = _a.peerId, displayName = _a.displayName;
                            var participant = _this.participants.get(peerId);
                            var peer = notification.data;
                            participant.displayName = displayName;
                            _this.participants.set(peerId, participant);
                            if (_this.listeners.onParticipantUpdate)
                                _this.listeners.onParticipantUpdate(_this.participants);
                        }
                        case "consumerClosed": {
                            var consumerId = notification.data.consumerId;
                            var consumer_2 = _this.consumers.get(consumerId);
                            if (!consumer_2)
                                break;
                            consumer_2.close();
                            _this.consumers.delete(consumerId);
                            var participant = _this.participants.get(consumer_2.appData.peerId);
                            if (participant)
                                participant.consumers = participant.consumers.filter(function (c) { return c.id !== consumer_2.id; });
                            if (_this.listeners.onParticipantUpdate)
                                _this.listeners.onParticipantUpdate(_this.participants);
                            break;
                        }
                        case "consumerPaused": {
                            var consumerId = notification.data.consumerId;
                            var consumer = _this.consumers.get(consumerId);
                            if (!consumer)
                                break;
                            consumer.pause();
                            if (_this.listeners.onParticipantUpdate)
                                _this.listeners.onParticipantUpdate(new Map(_this.participants));
                            break;
                        }
                        case "consumerResumed": {
                            var consumerId = notification.data.consumerId;
                            var consumer = _this.consumers.get(consumerId);
                            if (!consumer)
                                break;
                            consumer.resume();
                            if (_this.listeners.onParticipantUpdate)
                                _this.listeners.onParticipantUpdate(new Map(_this.participants));
                            break;
                        }
                        case "consumerLayersChanged": {
                            var _b = notification.data, consumerId = _b.consumerId, spatialLayer = _b.spatialLayer, temporalLayer = _b.temporalLayer;
                            var consumer = _this.consumers.get(consumerId);
                            if (!consumer)
                                break;
                            var participant = _this.participants.get(consumer.appData.peerId);
                            if (!participant)
                                break;
                            participant.consumerSpatialCurrentLayers.set(consumerId, spatialLayer);
                            participant.consumerTemporalCurrentLayers.set(consumerId, temporalLayer);
                            if (_this.listeners.onParticipantUpdate)
                                _this.listeners.onParticipantUpdate(_this.participants);
                            break;
                        }
                        case "consumerScore": {
                            break;
                        }
                        case "dataConsumerClosed": {
                            break;
                        }
                        case "activeSpeaker": {
                            var peerId = notification.data.peerId;
                            // turn all participant off
                            _this.participants.forEach(function (participant, peerId) {
                                participant.activeSpeaker = false;
                                _this.participants.set(peerId, participant);
                            });
                            if (peerId) {
                                var participant = _this.participants.get(peerId);
                                participant.activeSpeaker = true;
                                _this.participants.set(peerId, participant);
                            }
                            if (_this.listeners.onParticipantUpdate)
                                _this.listeners.onParticipantUpdate(_this.participants);
                        }
                        default: {
                            /*
                  this.logger.error(
                    `unknown protoo notification.method ${notification.method}`
                  );
                    */
                        }
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    SpikaBroadcastClient.prototype.pause = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    SpikaBroadcastClient.prototype.resume = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    SpikaBroadcastClient.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Close protoo Peer
                        this.protoo.close();
                        // Close mediasoup Transports.
                        return [4 /*yield*/, this._disableWebcam()];
                    case 1:
                        // Close mediasoup Transports.
                        _a.sent();
                        return [4 /*yield*/, this._disableMic()];
                    case 2:
                        _a.sent();
                        if (this.sendTransport)
                            this.sendTransport.close();
                        if (this.recvTransport)
                            this.recvTransport.close();
                        return [2 /*return*/];
                }
            });
        });
    };
    SpikaBroadcastClient.prototype.setCameraDevice = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    SpikaBroadcastClient.prototype.setMicrophoneDevice = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    SpikaBroadcastClient.prototype.setSpeakerDevice = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    SpikaBroadcastClient.prototype.updateCamera = function (device) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.webcam.device = device;
                        return [4 /*yield*/, this._disableWebcam()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._enableWebcam()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SpikaBroadcastClient.prototype.toggleCamera = function () {
        return __awaiter(this, void 0, void 0, function () {
            var success;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        success = false;
                        if (!this.cameraEnabled) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._disableWebcam()];
                    case 1:
                        success = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this._enableWebcam()];
                    case 3:
                        success = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (success) {
                            this.cameraEnabled = !this.cameraEnabled;
                            if (this.listeners.onCameraStateChanged)
                                this.listeners.onCameraStateChanged(this.cameraEnabled);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SpikaBroadcastClient.prototype.toggleScreenShare = function () {
        return __awaiter(this, void 0, void 0, function () {
            var success;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        success = false;
                        if (!this.screenShareEnabled) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._disableScreenShare()];
                    case 1:
                        success = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this._enableScreenShare()];
                    case 3:
                        success = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (success) {
                            this.screenShareEnabled = !this.screenShareEnabled;
                            console.log("this.screenShareEnabled", this.screenShareEnabled);
                            if (this.listeners.onScreenShareStateChanged)
                                this.listeners.onScreenShareStateChanged(this.screenShareEnabled);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SpikaBroadcastClient.prototype.updateMicrophone = function (device) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.microphone = device;
                        return [4 /*yield*/, this._disableMic()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._enableMic()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SpikaBroadcastClient.prototype.toggleMicrophone = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_1, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.micProducer) {
                            this.logger.warn("Microphone is not ready");
                            return [2 /*return*/];
                        }
                        if (!this.micEnabled) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        this.micProducer.pause();
                        return [4 /*yield*/, this.protoo.request("pauseProducer", {
                                producerId: this.micProducer.id,
                            })];
                    case 2:
                        _a.sent();
                        this.micEnabled = false;
                        if (this.listeners.onMicrophoneStateChanged)
                            this.listeners.onMicrophoneStateChanged(this.micEnabled);
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        this.logger.error("toggleMicrophone() failed");
                        this.logger.error("<span class=\"small\">" + Utils_1.default.printObj(e_1) + "</span>");
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 8];
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        this.micProducer.resume();
                        return [4 /*yield*/, this.protoo.request("resumeProducer", {
                                producerId: this.micProducer.id,
                            })];
                    case 6:
                        _a.sent();
                        this.micEnabled = true;
                        if (this.listeners.onMicrophoneStateChanged)
                            this.listeners.onMicrophoneStateChanged(this.micEnabled);
                        return [3 /*break*/, 8];
                    case 7:
                        e_2 = _a.sent();
                        this.logger.error("toggleMicrophone() failed");
                        this.logger.error("<span class=\"small\">" + Utils_1.default.printObj(e_2) + "</span>");
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    SpikaBroadcastClient.prototype.changeDisplayName = function (displayName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.protoo.request("changeDisplayName", { displayName: displayName })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SpikaBroadcastClient.prototype.getCameraState = function () {
        return this.cameraEnabled;
    };
    SpikaBroadcastClient.prototype.getMicrophoneState = function () {
        return this.micEnabled;
    };
    SpikaBroadcastClient.prototype._join = function () {
        return __awaiter(this, void 0, void 0, function () {
            var routerRtpCapabilities, stream, audioTrack_1, transportInfo, id, iceParameters, iceCandidates, dtlsParameters, sctpParameters, rcvTransportInfo, peers;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.debug("start join ");
                        this.mediasoupDevice = new mediasoupClient.Device({
                            handlerName: this.deviceHandlerName,
                        });
                        return [4 /*yield*/, this.protoo.request("getRouterRtpCapabilities")];
                    case 1:
                        routerRtpCapabilities = _a.sent();
                        this.logger.debug("↓routerRtpCapabilities");
                        //this.logger.debug(
                        //  `<span class="small">${Utils.printObj(routerRtpCapabilities)}</span>`
                        //);
                        return [4 /*yield*/, this.mediasoupDevice.load({ routerRtpCapabilities: routerRtpCapabilities })];
                    case 2:
                        //this.logger.debug(
                        //  `<span class="small">${Utils.printObj(routerRtpCapabilities)}</span>`
                        //);
                        _a.sent();
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia({ audio: true })];
                    case 3:
                        stream = _a.sent();
                        audioTrack_1 = stream.getAudioTracks()[0];
                        audioTrack_1.enabled = false;
                        setTimeout(function () { return audioTrack_1.stop(); }, 120000);
                        return [4 /*yield*/, this.protoo.request("createWebRtcTransport", {
                                forceTcp: false,
                                producing: true,
                                consuming: false,
                                sctpCapabilities: this.mediasoupDevice.sctpCapabilities,
                            })];
                    case 4:
                        transportInfo = _a.sent();
                        id = transportInfo.id, iceParameters = transportInfo.iceParameters, iceCandidates = transportInfo.iceCandidates, dtlsParameters = transportInfo.dtlsParameters, sctpParameters = transportInfo.sctpParameters;
                        this.sendTransport = this.mediasoupDevice.createSendTransport({
                            id: id,
                            iceParameters: iceParameters,
                            iceCandidates: iceCandidates,
                            dtlsParameters: dtlsParameters,
                            sctpParameters: sctpParameters,
                            iceServers: [],
                            proprietaryConstraints: PC_PROPRIETARY_CONSTRAINTS,
                            additionalSettings: {
                                encodedInsertableStreams: this.e2eKey,
                            },
                        });
                        this.sendTransport.on("connect", function (_a, callback, errback // eslint-disable-line no-shadow
                        ) {
                            var dtlsParameters = _a.dtlsParameters;
                            return __awaiter(_this, void 0, void 0, function () {
                                var params, error_2;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _b.trys.push([0, 2, , 3]);
                                            this.logger.debug("Transport connected");
                                            return [4 /*yield*/, this.protoo.request("connectWebRtcTransport", {
                                                    transportId: this.sendTransport.id,
                                                    dtlsParameters: dtlsParameters,
                                                })];
                                        case 1:
                                            params = _b.sent();
                                            callback();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            error_2 = _b.sent();
                                            errback(error_2);
                                            this.logger.debug("sendTransport error on connect");
                                            this.logger.error("<span class=\"small\">" + Utils_1.default.printObj(error_2) + "</span>");
                                            return [3 /*break*/, 3];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            });
                        });
                        this.sendTransport.on("produce", function (_a, callback, errback) {
                            var kind = _a.kind, rtpParameters = _a.rtpParameters, appData = _a.appData;
                            return __awaiter(_this, void 0, void 0, function () {
                                var produceResult, error_3;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _b.trys.push([0, 2, , 3]);
                                            this.logger.debug("Transport produce " + kind);
                                            return [4 /*yield*/, this.protoo.request("produce", {
                                                    transportId: this.sendTransport.id,
                                                    kind: kind,
                                                    rtpParameters: rtpParameters,
                                                    appData: appData,
                                                })];
                                        case 1:
                                            produceResult = _b.sent();
                                            this.logger.debug("Transport produceResult");
                                            callback({ id: produceResult.id });
                                            return [3 /*break*/, 3];
                                        case 2:
                                            error_3 = _b.sent();
                                            errback(error_3);
                                            this.logger.debug("sendTransport error on produce");
                                            this.logger.error("<span class=\"small\">" + Utils_1.default.printObj(error_3) + "</span>");
                                            return [3 /*break*/, 3];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            });
                        });
                        this.sendTransport.on("producedata", function (_a, callback, errback) {
                            var sctpStreamParameters = _a.sctpStreamParameters, label = _a.label, protocol = _a.protocol, appData = _a.appData;
                            return __awaiter(_this, void 0, void 0, function () {
                                var id_1, error_4;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _b.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, this.protoo.request("produceData", {
                                                    transportId: this.sendTransport.id,
                                                    sctpStreamParameters: sctpStreamParameters,
                                                    label: label,
                                                    protocol: protocol,
                                                    appData: appData,
                                                })];
                                        case 1:
                                            id_1 = (_b.sent()).id;
                                            callback({ id: id_1 });
                                            return [3 /*break*/, 3];
                                        case 2:
                                            error_4 = _b.sent();
                                            errback(error_4);
                                            this.logger.debug("sendTransport error on producedata");
                                            this.logger.error("<span class=\"small\">" + Utils_1.default.printObj(error_4) + "</span>");
                                            return [3 /*break*/, 3];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            });
                        });
                        this.sendTransport.on("connectionstatechange", function (connectionState) {
                            _this.logger.debug("connectionstatechange " + connectionState);
                        });
                        return [4 /*yield*/, this.protoo.request("createWebRtcTransport", {
                                forceTcp: false,
                                producing: false,
                                consuming: true,
                                sctpCapabilities: undefined,
                            })];
                    case 5:
                        rcvTransportInfo = _a.sent();
                        this.recvTransport = this.mediasoupDevice.createRecvTransport({
                            id: rcvTransportInfo.id,
                            iceParameters: rcvTransportInfo.iceParameters,
                            iceCandidates: rcvTransportInfo.iceCandidates,
                            dtlsParameters: rcvTransportInfo.dtlsParameters,
                            sctpParameters: rcvTransportInfo.sctpParameters,
                            iceServers: [],
                            additionalSettings: {
                                encodedInsertableStreams: this.e2eKey,
                            },
                        });
                        this.recvTransport.on("connect", function (_a, callback, errback // eslint-disable-line no-shadow
                        ) {
                            var dtlsParameters = _a.dtlsParameters;
                            _this.logger.debug("consumer transport connected");
                            _this.protoo
                                .request("connectWebRtcTransport", {
                                transportId: _this.recvTransport.id,
                                dtlsParameters: dtlsParameters,
                            })
                                .then(callback)
                                .catch(errback);
                        });
                        return [4 /*yield*/, this.protoo.request("join", {
                                displayName: this.displayName,
                                device: this.browser,
                                rtpCapabilities: this.mediasoupDevice.rtpCapabilities,
                                sctpCapabilities: this.mediasoupDevice.sctpCapabilities,
                            })];
                    case 6:
                        peers = (_a.sent()).peers;
                        peers.map(function (peer) {
                            _this.participants.set(peer.id, {
                                id: peer.id,
                                displayName: peer.displayName,
                                peer: peer,
                                consumers: [],
                                consumerVideoLayerType: new Map(),
                                consumerSpatialCurrentLayers: new Map(),
                                consumerTemporalCurrentLayers: new Map(),
                                activeSpeaker: false,
                            });
                            _this.logger.debug("new peer " + peer.id);
                        });
                        if (this.listeners.onParticipantUpdate)
                            this.listeners.onParticipantUpdate(this.participants);
                        return [4 /*yield*/, this._enableMic()];
                    case 7:
                        _a.sent();
                        if (!!this.micEnabled) return [3 /*break*/, 10];
                        // set initial state of mic
                        return [4 /*yield*/, this.micProducer.pause()];
                    case 8:
                        // set initial state of mic
                        _a.sent();
                        return [4 /*yield*/, this.protoo.request("pauseProducer", {
                                producerId: this.micProducer.id,
                            })];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10:
                        console.log("10");
                        if (!this.cameraEnabled) return [3 /*break*/, 12];
                        return [4 /*yield*/, this._enableWebcam()];
                    case 11:
                        _a.sent();
                        _a.label = 12;
                    case 12:
                        if (this.listeners.onJoined)
                            this.listeners.onJoined();
                        return [2 /*return*/];
                }
            });
        });
    };
    SpikaBroadcastClient.prototype._enableMic = function () {
        return __awaiter(this, void 0, void 0, function () {
            var track, devices, microphones, stream, _a, error_5;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.debug("enableMic()");
                        if (this.micProducer)
                            return [2 /*return*/];
                        if (!this.mediasoupDevice.canProduce("audio")) {
                            this.logger.error("enableMic() | cannot produce audio");
                            return [2 /*return*/];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        if (!!this.microphone) return [3 /*break*/, 3];
                        return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                    case 2:
                        devices = _b.sent();
                        microphones = devices.filter(function (device) { return device.kind == "audioinput"; });
                        this.microphone = microphones[0];
                        _b.label = 3;
                    case 3: return [4 /*yield*/, navigator.mediaDevices.getUserMedia({
                            audio: {
                                deviceId: this.microphone.deviceId,
                            },
                        })];
                    case 4:
                        stream = _b.sent();
                        track = stream.getAudioTracks()[0];
                        _a = this;
                        return [4 /*yield*/, this.sendTransport.produce({
                                track: track,
                                codecOptions: {
                                    opusStereo: true,
                                    opusDtx: true,
                                },
                                // NOTE: for testing codec selection.
                                // codec : this._mediasoupDevice.rtpCapabilities.codecs
                                // 	.find((codec) => codec.mimeType.toLowerCase() === 'audio/pcma')
                            })];
                    case 5:
                        _a.micProducer = _b.sent();
                        if (this.listeners.onStartAudio)
                            this.listeners.onStartAudio(this.micProducer);
                        if (this.e2eKey && e2e.isSupported()) {
                            e2e.setupSenderTransform(this.micProducer.rtpSender);
                        }
                        this.micProducer.on("newtransport", function () {
                            _this.logger.debug("new mic transport");
                        });
                        this.micProducer.on("transportclose", function () {
                            _this.micProducer = null;
                        });
                        this.micProducer.on("trackended", function () {
                            _this._disableMic().catch(function () { });
                        });
                        return [3 /*break*/, 7];
                    case 6:
                        error_5 = _b.sent();
                        this.logger.error("enableMic() failed");
                        this.logger.error("<span class=\"small\">" + Utils_1.default.printObj(error_5) + "</span>");
                        if (track)
                            track.stop();
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    SpikaBroadcastClient.prototype._disableMic = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.debug("disableMic()");
                        if (!this.micProducer)
                            return [2 /*return*/];
                        this.micProducer.close();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.protoo.request("closeProducer", {
                                producerId: this.micProducer.id,
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        this.logger.error("disable() failed");
                        this.logger.error("<span class=\"small\">" + Utils_1.default.printObj(error_6) + "</span>");
                        return [3 /*break*/, 4];
                    case 4:
                        this.micProducer = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    SpikaBroadcastClient.prototype._getExternalVideoStream = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.externalVideoStream)
                            return [2 /*return*/, this.externalVideoStream];
                        if (!(this.externalVideo.readyState < 3)) return [3 /*break*/, 2];
                        return [4 /*yield*/, new Promise(function (resolve) { return _this.externalVideo.addEventListener("canplay", resolve); })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (this.externalVideo.captureStream)
                            this.externalVideoStream = this.externalVideo.captureStream();
                        else if (this.externalVideo.mozCaptureStream)
                            this.externalVideoStream = this.externalVideo.mozCaptureStream();
                        else
                            throw new Error("video.captureStream() not supported");
                        return [2 /*return*/, this.externalVideoStream];
                }
            });
        });
    };
    SpikaBroadcastClient.prototype._enableWebcam = function () {
        return __awaiter(this, void 0, void 0, function () {
            var track, device, resolution, stream, stream, encodings, codec, codecOptions, firstVideoCodec, _a, error_7;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.debug("enableWebcam()");
                        if (this.webcamProducer)
                            return [2 /*return*/, false];
                        if (!this.mediasoupDevice.canProduce("video")) {
                            this.logger.error("enableWebcam() | cannot produce video");
                            return [2 /*return*/, false];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 8, , 9]);
                        if (!!this.externalVideo) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._updateWebcams()];
                    case 2:
                        _b.sent();
                        device = this.webcam.device;
                        resolution = this.webcam.resolution;
                        if (!device)
                            throw new Error("no webcam devices");
                        this.logger.debug("enableWebcam() | calling getUserMedia()");
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia({
                                video: __assign({ deviceId: { ideal: device.deviceId } }, VIDEO_CONSTRAINS[resolution]),
                            })];
                    case 3:
                        stream = _b.sent();
                        track = stream.getVideoTracks()[0];
                        return [3 /*break*/, 6];
                    case 4:
                        this.logger.debug("enableWebcam() | calling _getExternalVideoStream()");
                        device = { label: "external video" };
                        return [4 /*yield*/, this._getExternalVideoStream()];
                    case 5:
                        stream = _b.sent();
                        track = stream.getVideoTracks()[0].clone();
                        _b.label = 6;
                    case 6:
                        encodings = void 0;
                        codec = void 0;
                        codecOptions = {
                            videoGoogleStartBitrate: 1000,
                        };
                        if (this.forceH264) {
                            codec = this.mediasoupDevice.rtpCapabilities.codecs.find(function (c) { return c.mimeType.toLowerCase() === "video/h264"; });
                            if (!codec) {
                                throw new Error("desired H264 codec+configuration is not supported");
                            }
                        }
                        else if (this.forceVP9) {
                            codec = this.mediasoupDevice.rtpCapabilities.codecs.find(function (c) { return c.mimeType.toLowerCase() === "video/vp9"; });
                            if (!codec) {
                                throw new Error("desired VP9 codec+configuration is not supported");
                            }
                        }
                        firstVideoCodec = this.mediasoupDevice.rtpCapabilities.codecs.find(function (c) { return c.kind === "video"; });
                        if ((this.forceVP9 && codec) ||
                            firstVideoCodec.mimeType.toLowerCase() === "video/vp9") {
                            encodings = WEBCAM_KSVC_ENCODINGS;
                        }
                        else {
                            encodings = WEBCAM_SIMULCAST_ENCODINGS;
                        }
                        _a = this;
                        return [4 /*yield*/, this.sendTransport.produce({
                                track: track,
                                encodings: encodings,
                                codecOptions: codecOptions,
                                codec: codec,
                            })];
                    case 7:
                        _a.webcamProducer = _b.sent();
                        //this.logger.debug("webcamProducer");
                        //this.logger.debug(
                        //  `<span class="small">${Utils.printObj(this.webcamProducer)}</span>`
                        //);
                        if (this.listeners.onStartVideo)
                            this.listeners.onStartVideo(this.webcamProducer);
                        if (this.e2eKey && e2e.isSupported()) {
                            e2e.setupSenderTransform(this.webcamProducer.rtpSender);
                        }
                        this.webcamProducer.on("transportclose", function () {
                            _this.logger.debug("webcam transportclose");
                            _this.webcamProducer = null;
                        });
                        this.webcamProducer.on("trackended", function () {
                            _this.logger.debug("webcam trackended");
                            _this._disableWebcam().catch(function () { });
                        });
                        return [2 /*return*/, true];
                    case 8:
                        error_7 = _b.sent();
                        this.logger.error("enableWebcam() failed");
                        this.logger.error("<span class=\"small\">" + Utils_1.default.printObj(error_7) + "</span>");
                        if (track)
                            track.stop();
                        return [2 /*return*/, false];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    SpikaBroadcastClient.prototype._disableWebcam = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.debug("disableWebcam()");
                        if (!this.webcamProducer)
                            return [2 /*return*/, false];
                        this.webcamProducer.close();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.protoo.request("closeProducer", {
                                producerId: this.webcamProducer.id,
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_8 = _a.sent();
                        this.logger.error("closeProducer failed");
                        return [2 /*return*/, false];
                    case 4:
                        this.webcamProducer = null;
                        return [2 /*return*/, true];
                }
            });
        });
    };
    SpikaBroadcastClient.prototype._updateWebcams = function () {
        return __awaiter(this, void 0, void 0, function () {
            var devices, _i, devices_1, device, array, len, currentWebcamId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.debug("_updateWebcams()");
                        // Reset the list.
                        this.webcams = new Map();
                        this.logger.debug("_updateWebcams() | calling enumerateDevices()");
                        return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                    case 1:
                        devices = _a.sent();
                        //this.logger.debug("mediaDevices");
                        //this.logger.debug(`<span class="small">${Utils.printObj(devices)}</span>`);
                        for (_i = 0, devices_1 = devices; _i < devices_1.length; _i++) {
                            device = devices_1[_i];
                            if (device.kind !== "videoinput")
                                continue;
                            //this.logger.debug("webcam found");
                            //this.logger.debug(`<span class="small">${Utils.printObj(device)}</span>`);
                            this.webcams.set(device.deviceId, device);
                        }
                        array = Array.from(this.webcams.values());
                        len = array.length;
                        currentWebcamId = this.webcam.device ? this.webcam.device.deviceId : undefined;
                        this.logger.debug("update webcams currentWebcamId " + currentWebcamId + ", cam number " + len);
                        if (len === 0)
                            this.webcam.device = null;
                        else if (!this.webcams.has(currentWebcamId))
                            this.webcam.device = array[0];
                        return [2 /*return*/];
                }
            });
        });
    };
    SpikaBroadcastClient.prototype._disableScreenShare = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.debug("disableShare()");
                        if (!this.shareProducer)
                            return [2 /*return*/, false];
                        this.shareProducer.close();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.protoo.request("closeProducer", { producerId: this.shareProducer.id })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_9 = _a.sent();
                        this.logger.error("failed to dislable screen share");
                        return [2 /*return*/, false];
                    case 4:
                        this.shareProducer = null;
                        return [2 /*return*/, true];
                }
            });
        });
    };
    SpikaBroadcastClient.prototype._enableScreenShare = function () {
        return __awaiter(this, void 0, void 0, function () {
            var track, stream, encodings, codec, codecOptions, _a, error_10;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.debug("enableShare()");
                        if (this.shareProducer)
                            return [2 /*return*/, false];
                        if (!this.mediasoupDevice.canProduce("video")) {
                            this.logger.error("enableShare() | cannot produce video");
                            return [2 /*return*/, false];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        this.logger.debug("enableShare() | calling getUserMedia()");
                        return [4 /*yield*/, navigator.mediaDevices.getDisplayMedia({
                                audio: false,
                                video: true,
                            })];
                    case 2:
                        stream = _b.sent();
                        // May mean cancelled (in some implementations).
                        if (!stream) {
                            return [2 /*return*/];
                        }
                        track = stream.getVideoTracks()[0];
                        encodings = void 0;
                        codec = void 0;
                        codecOptions = {
                            videoGoogleStartBitrate: 1000,
                        };
                        if (this.forceH264) {
                            codec = this.mediasoupDevice.rtpCapabilities.codecs.find(function (c) { return c.mimeType.toLowerCase() === "video/h264"; });
                            if (!codec) {
                                throw new Error("desired H264 codec+configuration is not supported");
                            }
                        }
                        else if (this.forceVP9) {
                            codec = this.mediasoupDevice.rtpCapabilities.codecs.find(function (c) { return c.mimeType.toLowerCase() === "video/vp9"; });
                            if (!codec) {
                                throw new Error("desired VP9 codec+configuration is not supported");
                            }
                        }
                        _a = this;
                        return [4 /*yield*/, this.sendTransport.produce({
                                track: track,
                                encodings: encodings,
                                codecOptions: codecOptions,
                                codec: codec,
                                appData: {
                                    share: true,
                                },
                            })];
                    case 3:
                        _a.shareProducer = _b.sent();
                        if (this.listeners.onStartShare)
                            this.listeners.onStartShare(this.shareProducer);
                        if (this.e2eKey && e2e.isSupported()) {
                            e2e.setupSenderTransform(this.shareProducer.rtpSender);
                        }
                        this.shareProducer.on("transportclose", function () {
                            _this.shareProducer = null;
                        });
                        this.shareProducer.on("trackended", function () {
                            _this._disableScreenShare().catch(function () { });
                        });
                        return [2 /*return*/, true];
                    case 4:
                        error_10 = _b.sent();
                        this.logger.error("enableShare() | failed:%o");
                        if (track)
                            track.stop();
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return SpikaBroadcastClient;
}());
exports.default = SpikaBroadcastClient;
//# sourceMappingURL=SpikaBroadcastClient.js.map