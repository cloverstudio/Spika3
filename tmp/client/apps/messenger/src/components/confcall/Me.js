"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var PeerView_1 = __importDefault(require("./PeerView"));
exports.default = (function (_a) {
    var videoProducer = _a.videoProducer, audioProducer = _a.audioProducer;
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(PeerView_1.default, { isMe: true, videoTrack: videoProducer && videoProducer.track, audioTrack: audioProducer && audioProducer.track, muteAudio: true, muteVideo: true })));
});
//# sourceMappingURL=Me.js.map