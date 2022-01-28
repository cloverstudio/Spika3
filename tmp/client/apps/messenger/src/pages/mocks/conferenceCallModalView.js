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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var material_1 = require("@mui/material");
var MediaOutputModalView = function (_a) {
    var openModal = _a.openModal, setOpenModal = _a.setOpenModal, isItAudio = _a.isItAudio, selectedVideoOutput = _a.selectedVideoOutput, selectedAudioOutput = _a.selectedAudioOutput;
    var _b = react_1.default.useState(null), videoDevices = _b[0], setVideoDevices = _b[1];
    var _c = react_1.default.useState(null), audioDevices = _c[0], setAudioDevices = _c[1];
    var _d = react_1.default.useState(null), selectedVideoDevice = _d[0], setSelectedVideoDevice = _d[1];
    var _e = react_1.default.useState(null), selectedAudioDevice = _e[0], setSelectedAudioDevice = _e[1];
    var _f = react_1.default.useState(openModal), open = _f[0], setOpen = _f[1];
    var handleClose = function () {
        setOpen(false);
        setOpenModal(false);
    };
    var handleOutputChange = function (event) {
        if (isItAudio) {
            var filter = audioDevices.filter(function (device) {
                return device.deviceId.includes(event.target.value);
            });
            console.log(filter);
            setSelectedAudioDevice(filter[0]);
        }
        else {
            var filter = videoDevices.filter(function (device) {
                return device.deviceId.includes(event.target.value);
            });
            console.log(filter);
            setSelectedVideoDevice(filter[0]);
        }
    };
    (0, react_1.useEffect)(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var devices, audioDevices, videoDevices;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, navigator.mediaDevices.getUserMedia({ audio: true, video: true })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                    case 2:
                        devices = _a.sent();
                        audioDevices = devices.filter(function (device) { return device.kind === "audioinput"; });
                        setAudioDevices(audioDevices);
                        setSelectedAudioDevice(audioDevices[0]);
                        videoDevices = devices.filter(function (device) { return device.kind === "videoinput"; });
                        setVideoDevices(videoDevices);
                        console.log(videoDevices);
                        setSelectedVideoDevice(videoDevices[0]);
                        return [2 /*return*/];
                }
            });
        }); })();
    }, []);
    return (react_1.default.createElement(material_1.Dialog, { fullWidth: true, maxWidth: "sm", open: open, onClose: handleClose },
        react_1.default.createElement(material_1.DialogTitle, null, isItAudio ? "Audio output options" : "Video output options"),
        react_1.default.createElement(material_1.DialogContent, null,
            react_1.default.createElement(material_1.DialogContentText, null, "Choose media output from the list"),
            react_1.default.createElement(material_1.Box, { noValidate: true, component: "form", sx: {
                    display: "flex",
                    flexDirection: "column",
                    m: "auto",
                    width: "fit-content",
                } }, selectedVideoDevice != null ? (react_1.default.createElement(material_1.FormControl, { sx: { mt: 2, minWidth: 320 } },
                react_1.default.createElement(material_1.InputLabel, { htmlFor: "max-width" }, "Device"),
                react_1.default.createElement(material_1.Select, { autoFocus: true, value: isItAudio
                        ? selectedAudioDevice.deviceId
                        : selectedVideoDevice.groupId, onChange: handleOutputChange, label: "maxWidth", inputProps: {
                        name: "max-width",
                        id: "max-width",
                    } }, isItAudio && audioDevices != null ? (audioDevices != null && audioDevices.length > 0 ? (audioDevices.map(function (audio) { return (react_1.default.createElement(material_1.MenuItem, { value: audio.deviceId, key: audio.deviceId }, audio.label)); })) : (react_1.default.createElement(material_1.Box, null))) : videoDevices != null && videoDevices.length > 0 ? (videoDevices.map(function (video) { return (react_1.default.createElement(material_1.MenuItem, { value: video.groupId, key: video.groupId }, video.label)); })) : (react_1.default.createElement(material_1.Box, null))))) : (react_1.default.createElement(material_1.Box, null, " ")))),
        react_1.default.createElement(material_1.DialogActions, null,
            react_1.default.createElement(material_1.Button, { onClick: handleClose }, "Close"))));
};
exports.default = MediaOutputModalView;
//# sourceMappingURL=conferenceCallModalView.js.map