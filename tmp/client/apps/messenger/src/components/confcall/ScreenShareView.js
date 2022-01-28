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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
exports.default = (function (_a) {
    var videoTrack = _a.videoTrack;
    var videoElm = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        if (videoTrack) {
            var stream = new MediaStream();
            stream.addTrack(videoTrack);
            videoElm.current.srcObject = stream;
            videoElm.current.onpause = function () { };
            videoElm.current
                .play()
                .catch(function (error) { return console.error("videoElem.play() failed:%o", error); });
        }
        else {
            videoElm.current.srcObject = null;
        }
    }, [videoTrack]);
    return (react_1.default.createElement("video", { ref: videoElm, autoPlay: true, playsInline: true, controls: false }));
});
//# sourceMappingURL=ScreenShareView.js.map