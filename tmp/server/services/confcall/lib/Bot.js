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
var Logger = require('./Logger');
var logger = new Logger('Bot');
var Bot = /** @class */ (function () {
    function Bot(_a) {
        var transport = _a.transport, dataProducer = _a.dataProducer;
        // mediasoup DirectTransport.
        this._transport = transport;
        // mediasoup DataProducer.
        this._dataProducer = dataProducer;
    }
    Bot.create = function (_a) {
        var mediasoupRouter = _a.mediasoupRouter;
        return __awaiter(this, void 0, void 0, function () {
            var transport, dataProducer, bot;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, mediasoupRouter.createDirectTransport({
                            maxMessageSize: 512
                        })];
                    case 1:
                        transport = _b.sent();
                        return [4 /*yield*/, transport.produceData({ label: 'bot' })];
                    case 2:
                        dataProducer = _b.sent();
                        bot = new Bot({ transport: transport, dataProducer: dataProducer });
                        return [2 /*return*/, bot];
                }
            });
        });
    };
    Object.defineProperty(Bot.prototype, "dataProducer", {
        get: function () {
            return this._dataProducer;
        },
        enumerable: false,
        configurable: true
    });
    Bot.prototype.close = function () {
        // No need to do anyting.
    };
    Bot.prototype.handlePeerDataProducer = function (_a) {
        var dataProducerId = _a.dataProducerId, peer = _a.peer;
        return __awaiter(this, void 0, void 0, function () {
            var dataConsumer;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._transport.consumeData({
                            dataProducerId: dataProducerId
                        })];
                    case 1:
                        dataConsumer = _b.sent();
                        dataConsumer.on('message', function (message, ppid) {
                            // Ensure it's a WebRTC DataChannel string.
                            if (ppid !== 51) {
                                logger.warn('ignoring non string messagee from a Peer');
                                return;
                            }
                            var text = message.toString('utf8');
                            logger.debug('SCTP message received [peerId:%s, size:%d]', peer.id, message.byteLength);
                            // Create a message to send it back to all Peers in behalf of the sending
                            // Peer.
                            var messageBack = peer.data.displayName + " said me: \"" + text + "\"";
                            _this._dataProducer.send(messageBack);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return Bot;
}());
module.exports = Bot;
//# sourceMappingURL=Bot.js.map