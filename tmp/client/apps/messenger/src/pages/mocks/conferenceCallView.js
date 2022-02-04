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
var react_1 = __importStar(require("react"));
var material_1 = require("@mui/material");
var icons_material_1 = require("@mui/icons-material");
var defaults = __importStar(require("../mocks/confcall"));
var conferenceCallItem_1 = __importDefault(require("../mocks/conferenceCallItem"));
var conferenceCallModalView_1 = __importDefault(require("./conferenceCallModalView"));
function ConferenceCallView() {
    var _this = this;
    var dataArray = defaults.participants;
    var myData = defaults.me;
    var _a = react_1.default.useState(false), open = _a[0], setOpen = _a[1];
    var _b = react_1.default.useState(0), participantCount = _b[0], setParticipantCount = _b[1];
    var _c = react_1.default.useState(6), gridSize = _c[0], setGridSize = _c[1];
    var _d = react_1.default.useState(dataArray), combinedArray = _d[0], setCombinedArray = _d[1];
    var _e = react_1.default.useState(null), videoDevices = _e[0], setVideoDevices = _e[1];
    var _f = react_1.default.useState(null), audioDevices = _f[0], setAudioDevices = _f[1];
    var _g = react_1.default.useState(null), selectedVideoDevice = _g[0], setSelectedVideoDevice = _g[1];
    var _h = react_1.default.useState(null), selectedAudioDevice = _h[0], setSelectedAudioDevice = _h[1];
    var _j = react_1.default.useState(false), openModal = _j[0], setOpenModal = _j[1];
    var _k = react_1.default.useState(false), isItAudio = _k[0], setIsItAudio = _k[1];
    var _l = react_1.default.useState(false), mute = _l[0], setMute = _l[1];
    var _m = react_1.default.useState(false), cameraOff = _m[0], setCameraOff = _m[1];
    var _o = react_1.default.useState(false), screenShare = _o[0], setScreenShare = _o[1];
    var handleCamera = function () {
        setCameraOff(!cameraOff);
    };
    var chooseVideoOutput = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setIsItAudio(false);
            setOpenModal(true);
            return [2 /*return*/];
        });
    }); };
    var handleMic = function () {
        setMute(!mute);
    };
    var chooseAudioOutput = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("dal udje");
            setIsItAudio(true);
            setOpenModal(true);
            return [2 /*return*/];
        });
    }); };
    var handleGroup = function () { };
    var handleShare = function () {
        setScreenShare(!screenShare);
    };
    var closeConference = function () { };
    var handleDrawerOpen = function () {
        console.log("click");
        setOpen(true);
    };
    var handleDrawerClose = function () {
        setOpen(false);
    };
    var calculateLayoutByParticipantNumber = function () {
        var numberOfParticipants = dataArray.length + 1;
        var indexForOwnData = 0;
        if (numberOfParticipants > 2 && numberOfParticipants < 5) {
            if (!screenShare) {
                setGridSize(6);
                indexForOwnData = 2;
            }
        }
        if (numberOfParticipants > 4 && numberOfParticipants < 7) {
            if (!screenShare) {
                setGridSize(4);
                indexForOwnData = 3;
            }
        }
        if (numberOfParticipants > 6) {
            if (!screenShare) {
                setGridSize(3);
                var numberOfRows = Math.floor(dataArray.length / 4);
                console.log(numberOfParticipants);
                indexForOwnData = numberOfRows * 4;
            }
        }
        if (screenShare) {
            setGridSize(12);
            indexForOwnData = dataArray.length;
        }
        var newData = dataArray.slice(0); // copy
        newData.splice(indexForOwnData, 0, myData);
        console.log(indexForOwnData);
        setCombinedArray(newData);
        setParticipantCount(newData.length);
    };
    (0, react_1.useEffect)(function () {
        calculateLayoutByParticipantNumber();
    }, [screenShare]);
    return (react_1.default.createElement(material_1.Box, { sx: { display: "flex", backgroundColor: "lightgray" }, position: "relative" },
        screenShare ? (react_1.default.createElement(material_1.Stack, { direction: "row", alignItems: "right", spacing: 1, sx: { display: "flex", flexDirection: "row", justifyContent: "right" } },
            react_1.default.createElement(material_1.Box, { width: "80vw", height: "91vh", my: 1, display: "flex", justifyContent: "center" }, "Screen share"),
            react_1.default.createElement(material_1.Box, { width: "20vw", height: "91vh", my: 1, display: "flex", justifyContent: "center" },
                react_1.default.createElement(material_1.Grid, { container: true, rowSpacing: 1, columnSpacing: { xs: 1, sm: 1, md: 1 } }, combinedArray.map(function (row) { return (react_1.default.createElement(material_1.Grid, { item: true, xs: gridSize, lg: gridSize, xl: gridSize },
                    react_1.default.createElement(conferenceCallItem_1.default, { participant: row }))); }))))) : ([
            combinedArray.length < 3 ? (react_1.default.createElement(material_1.Box, { width: "100%", height: "91vh", position: "relative" },
                react_1.default.createElement(material_1.Box, { width: "100%", height: "100%" },
                    react_1.default.createElement(conferenceCallItem_1.default, { participant: dataArray[0] })),
                react_1.default.createElement(material_1.Box, { width: "30%", height: "30%", position: "absolute", bottom: "0", left: "0" },
                    react_1.default.createElement(conferenceCallItem_1.default, { participant: myData })))) : (react_1.default.createElement(material_1.Box, { width: "100%", height: "91vh", my: 1, display: "flex", justifyContent: "center" },
                react_1.default.createElement(material_1.Grid, { container: true, rowSpacing: 1, columnSpacing: { xs: 1, sm: 1, md: 1 } }, combinedArray.map(function (row) { return (react_1.default.createElement(material_1.Grid, { item: true, xs: gridSize, lg: gridSize, xl: gridSize },
                    react_1.default.createElement(conferenceCallItem_1.default, { participant: row }))); })))),
        ]),
        react_1.default.createElement(material_1.Box, { position: "fixed", bottom: "0", left: "0", height: "8vh", width: "100%", sx: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                background: "linear-gradient(rgba(255,255,255,.2) 40%, rgba(150,150,150,.8))",
            } },
            react_1.default.createElement(material_1.Stack, { direction: "row", alignItems: "center", spacing: 2, sx: { display: "flex", flexDirection: "row", justifyContent: "center" } },
                react_1.default.createElement(material_1.Box, null,
                    react_1.default.createElement(material_1.IconButton, { sx: { padding: 0 }, onClick: handleCamera }, cameraOff ? (react_1.default.createElement(icons_material_1.VideocamOff, { style: { fill: "white" } })) : (react_1.default.createElement(icons_material_1.Videocam, { style: { fill: "white" } }))),
                    react_1.default.createElement(material_1.IconButton, { sx: { padding: 0 }, onClick: chooseVideoOutput },
                        react_1.default.createElement(icons_material_1.KeyboardArrowUp, { fontSize: "small", style: { fill: "white" } }))),
                react_1.default.createElement(material_1.Box, null,
                    react_1.default.createElement(material_1.IconButton, { sx: { padding: 0 }, onClick: handleMic }, mute ? (react_1.default.createElement(icons_material_1.MicOff, { style: { fill: "white" } })) : (react_1.default.createElement(icons_material_1.Mic, { style: { fill: "white" } }))),
                    react_1.default.createElement(material_1.IconButton, { sx: { padding: 0 }, onClick: chooseAudioOutput },
                        react_1.default.createElement(icons_material_1.KeyboardArrowUp, { fontSize: "small", style: { fill: "white" } }))),
                react_1.default.createElement(material_1.IconButton, { onClick: handleGroup },
                    react_1.default.createElement(icons_material_1.Groups, { style: { fill: "white" } })),
                react_1.default.createElement(material_1.IconButton, { onClick: handleShare },
                    react_1.default.createElement(icons_material_1.Monitor, { style: { fill: "white" } })),
                react_1.default.createElement(material_1.IconButton, { onClick: closeConference },
                    react_1.default.createElement(icons_material_1.Close, { style: { fill: "red" } })))),
        openModal ? (react_1.default.createElement(conferenceCallModalView_1.default, { isItAudio: isItAudio, openModal: openModal, setOpenModal: setOpenModal, selectedAudioOutput: setSelectedAudioDevice, selectedVideoOutput: setSelectedVideoDevice })) : (react_1.default.createElement(material_1.Box, null))));
}
exports.default = ConferenceCallView;
//# sourceMappingURL=conferenceCallView.js.map