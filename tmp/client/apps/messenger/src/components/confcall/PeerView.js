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
var react_1 = __importStar(require("react"));
var hark_1 = __importDefault(require("hark"));
exports.default = (function (_a) {
    var videoTrack = _a.videoTrack, audioTrack = _a.audioTrack, _b = _a.muteVideo, muteVideo = _b === void 0 ? false : _b, _c = _a.muteAudio, muteAudio = _c === void 0 ? false : _c, audioRtpParameters = _a.audioRtpParameters, videoRtpParameters = _a.videoRtpParameters, consumerSpatialLayers = _a.consumerSpatialLayers, consumerTemporalLayers = _a.consumerTemporalLayers, consumerCurrentSpatialLayer = _a.consumerCurrentSpatialLayer, consumerCurrentTemporalLayer = _a.consumerCurrentTemporalLayer, consumerPreferredSpatialLayer = _a.consumerPreferredSpatialLayer, consumerPreferredTemporalLayer = _a.consumerPreferredTemporalLayer, consumerPriority = _a.consumerPriority, audioConsumerId = _a.audioConsumerId, videoConsumerId = _a.videoConsumerId, videoMultiLayer = _a.videoMultiLayer, audioCodec = _a.audioCodec, videoCodec = _a.videoCodec, _d = _a.isMe, isMe = _d === void 0 ? false : _d, videoLayerType = _a.videoLayerType, displayName = _a.displayName;
    var videoElm = (0, react_1.useRef)(null);
    var audioElm = (0, react_1.useRef)(null);
    var _e = (0, react_1.useState)(0), videoResolutionHeight = _e[0], setVideoResolutionHegith = _e[1];
    var _f = (0, react_1.useState)(0), videoResolutionWidth = _f[0], setVideoResolutionWidth = _f[1];
    var _g = (0, react_1.useState)(null), videoResolutionTimer = _g[0], setVideoResolutionTimer = _g[1];
    (0, react_1.useEffect)(function () {
        if (audioTrack) {
            var stream = new MediaStream();
            stream.addTrack(audioTrack);
            audioElm.current.srcObject = stream;
            audioElm.current.play().catch(function (error) { return console.error(error); });
            if (!stream.getAudioTracks()[0])
                return;
            var _hark = (0, hark_1.default)(stream, { play: false });
            _stopVideoResolution();
            // eslint-disable-next-line no-unused-vars
            _hark.on("volume_change", function (dBs, threshold) {
                var audioVolume = Math.round(Math.pow(10, dBs / 85) * 10);
                /*
        if (audioVolume === 1) audioVolume = 0;

        if (audioVolume !== this.state.audioVolume)
          this.setState({ audioVolume });
        */
            });
        }
        else {
            audioElm.current.srcObject = null;
        }
    }, [audioTrack]);
    (0, react_1.useEffect)(function () {
        if (videoTrack) {
            var stream = new MediaStream();
            stream.addTrack(videoTrack);
            videoElm.current.srcObject = stream;
            videoElm.current.oncanplay = function () { };
            videoElm.current.onplay = function () {
                audioElm && audioElm.current && audioElm.current.play().catch(function (error) { });
            };
            videoElm.current.onpause = function () { };
            videoElm.current
                .play()
                .catch(function (error) { return console.error("videoElem.play() failed:%o", error); });
            _startVideoResolution();
        }
        else {
            videoElm.current.srcObject = null;
        }
    }, [videoTrack]);
    var _startVideoResolution = function () {
        var videoResolutionPeriodicTimer = setInterval(function () {
            if (!videoElm || !videoElm.current)
                return;
            if (videoElm.current.videoWidth !== videoResolutionWidth ||
                videoElm.current.videoHeight !== videoResolutionHeight) {
                setVideoResolutionHegith(videoElm.current.videoHeight);
                setVideoResolutionWidth(videoElm.current.videoWidth);
            }
        }, 500);
        setVideoResolutionTimer(videoResolutionPeriodicTimer);
    };
    var _stopVideoResolution = function () {
        if (!videoResolutionTimer)
            return;
        clearInterval(videoResolutionTimer);
        setVideoResolutionHegith(0);
        setVideoResolutionWidth(0);
    };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        isMe ? null : (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "info" }, displayName),
            react_1.default.createElement("div", { className: "info2" },
                muteAudio ? (react_1.default.createElement("i", { className: "fas fa-microphone-slash" })) : (react_1.default.createElement("i", { className: "fas fa-microphone" })),
                muteVideo ? (react_1.default.createElement("i", { className: "fas fa-video" })) : (react_1.default.createElement("i", { className: "fas fa-video-slash" }))))),
        react_1.default.createElement("span", null, displayName ? displayName.substring(0, 1) : ""),
        videoElm ? (react_1.default.createElement("video", { ref: videoElm, autoPlay: true, playsInline: true, controls: false, muted: muteVideo })) : (react_1.default.createElement("video", { autoPlay: true, playsInline: true, controls: false, muted: muteVideo })),
        react_1.default.createElement("audio", { ref: audioElm, autoPlay: true, playsInline: true, controls: false, muted: muteAudio }),
        !isMe && false ? (react_1.default.createElement("div", { className: "consumer-info" },
            react_1.default.createElement("ul", null,
                react_1.default.createElement("li", null,
                    "AudioConsumerId: ",
                    audioConsumerId),
                react_1.default.createElement("li", null,
                    "videoConsumerId: ",
                    videoConsumerId),
                react_1.default.createElement("li", null,
                    "Audio: ",
                    audioCodec),
                react_1.default.createElement("li", null,
                    "VideoCodec: ",
                    videoCodec),
                react_1.default.createElement("li", null,
                    "AudioCodec: ",
                    audioCodec),
                react_1.default.createElement("li", null,
                    "VideoTrack: ",
                    videoTrack ? "On" : "Off"),
                react_1.default.createElement("li", null,
                    "AudioTrack: ",
                    audioTrack ? "On" : "Off"),
                react_1.default.createElement("li", null,
                    "VideoLayerType: ",
                    videoLayerType),
                react_1.default.createElement("li", null,
                    "videoMultiLayer: ",
                    videoMultiLayer ? "yes" : "no"),
                react_1.default.createElement("li", null, "current spatial-temporal layers: " + consumerCurrentSpatialLayer + " " + consumerCurrentTemporalLayer),
                react_1.default.createElement("li", null, "preferred spatial-temporal layers: " + consumerPreferredSpatialLayer + " " + consumerPreferredTemporalLayer)))) : null));
});
//# sourceMappingURL=PeerView.js.map