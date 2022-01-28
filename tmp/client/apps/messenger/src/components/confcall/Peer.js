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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var mediasoupClient = __importStar(require("mediasoup-client"));
var PeerView_1 = __importDefault(require("./PeerView"));
exports.default = (function (_a) {
    var participant = _a.participant;
    var audioConsumer = participant.consumers.find(function (consumer) { return consumer.track.kind === "audio"; });
    var videoConsumer = participant.consumers.find(function (consumer) { return consumer.track.kind === "video"; });
    var audioCodec = audioConsumer
        ? audioConsumer.rtpParameters.codecs[0].mimeType.split("/")[1]
        : null;
    var videoCodec = videoConsumer
        ? videoConsumer.rtpParameters.codecs[0].mimeType.split("/")[1]
        : null;
    var videoScalabilityMode = videoConsumer
        ? mediasoupClient.parseScalabilityMode(videoConsumer.rtpParameters.encodings[0].scalabilityMode)
        : null;
    var videoSpatialCurrentLayer = videoConsumer
        ? participant.consumerSpatialCurrentLayers.get(videoConsumer.id)
        : 0;
    var videoTemporaryCurrentLayer = videoConsumer
        ? participant.consumerTemporalCurrentLayers.get(videoConsumer.id)
        : 0;
    var consumerVideoLayerType = videoConsumer
        ? participant.consumerVideoLayerType.get(videoConsumer.id)
        : "";
    return (react_1.default.createElement(PeerView_1.default, { isMe: false, peer: participant.peer, muteAudio: audioConsumer && audioConsumer.paused ? true : false, muteVideo: videoConsumer ? true : false, audioConsumerId: audioConsumer ? audioConsumer.id : null, videoConsumerId: videoConsumer ? videoConsumer.id : null, audioRtpParameters: audioConsumer ? audioConsumer.rtpParameters : null, videoRtpParameters: videoConsumer ? videoConsumer.rtpParameters : null, consumerSpatialLayers: videoScalabilityMode ? videoScalabilityMode.spatialLayers : null, consumerTemporalLayers: videoScalabilityMode ? videoScalabilityMode.temporalLayers : null, consumerCurrentSpatialLayer: videoSpatialCurrentLayer, consumerCurrentTemporalLayer: videoTemporaryCurrentLayer, consumerPreferredSpatialLayer: videoScalabilityMode ? videoScalabilityMode.spatialLayers - 1 : null, consumerPreferredTemporalLayer: videoScalabilityMode ? videoScalabilityMode.temporalLayers - 1 : null, audioTrack: audioConsumer ? audioConsumer.track : null, videoTrack: videoConsumer ? videoConsumer.track : null, videoMultiLayer: videoConsumer && consumerVideoLayerType !== "simple", audioCodec: audioCodec ? audioCodec : null, videoCodec: videoCodec ? videoCodec : null, videoLayerType: consumerVideoLayerType, displayName: participant.displayName }));
});
//# sourceMappingURL=Peer.js.map