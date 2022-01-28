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
var react_1 = __importStar(require("react"));
var react_router_dom_1 = require("react-router-dom");
var SpikaBroadcastClient_1 = __importStar(require("./lib/SpikaBroadcastClient"));
var Utils_1 = __importDefault(require("./lib/Utils"));
var Peer_1 = __importDefault(require("./Peer"));
var ScreenShareView_1 = __importDefault(require("./ScreenShareView"));
var Me_1 = __importDefault(require("./Me"));
var dayjs_1 = __importDefault(require("dayjs"));
var Modal_1 = __importDefault(require("./Modal"));
var MicrophoneSelectorModal_1 = __importDefault(require("./MicrophoneSelectorModal"));
var VideoSelectorModal_1 = __importDefault(require("./VideoSelectorModal"));
var Constants = __importStar(require("./lib/Constants"));
var camera_svg_1 = __importDefault(require("./assets/img/camera.svg"));
var mic_svg_1 = __importDefault(require("./assets/img/mic.svg"));
var cameraoff_svg_1 = __importDefault(require("./assets/img/cameraoff.svg"));
var micoff_svg_1 = __importDefault(require("./assets/img/micoff.svg"));
var exit_svg_1 = __importDefault(require("./assets/img/exit.svg"));
var screenshare_svg_1 = __importDefault(require("./assets/img/screenshare.svg"));
var screenshareoff_svg_1 = __importDefault(require("./assets/img/screenshareoff.svg"));
var users_svg_1 = __importDefault(require("./assets/img/users.svg"));
var settingarrow_svg_1 = __importDefault(require("./assets/img/settingarrow.svg"));
function Conference(_a) {
    var _this = this;
    var onClose = _a.onClose;
    var history = (0, react_router_dom_1.useHistory)();
    var myVideoElm = (0, react_1.useRef)(null);
    var _b = (0, react_1.useState)(null), participants = _b[0], setParticipants = _b[1];
    var _c = (0, react_1.useState)([]), consumerRefs = _c[0], setConsumerRefs = _c[1];
    var _d = (0, react_1.useState)(localStorage.getItem(Constants.LSKEY_MUTECAM) === "0" ? false : true), cameraEnabled = _d[0], setCameraEnabled = _d[1];
    var _e = (0, react_1.useState)(false), screenShareEnabled = _e[0], setScreenShareEnabled = _e[1];
    ("");
    var _f = (0, react_1.useState)(localStorage.getItem(Constants.LSKEY_MUTEMIC) === "0" ? false : true), micEnabled = _f[0], setMicEnabled = _f[1];
    var _g = (0, react_1.useState)(null), spikabroadcastClient = _g[0], setSpikabroadcastClient = _g[1];
    var _h = (0, react_1.useState)(null), webcamProcuder = _h[0], setWebcamProducer = _h[1];
    var _j = (0, react_1.useState)(null), microphoneProducer = _j[0], setMicrophoneProducer = _j[1];
    var _k = (0, react_1.useState)(null), screenShareProducer = _k[0], setScreenshareProducer = _k[1];
    var _l = (0, react_1.useState)([]), log = _l[0], setLog = _l[1];
    var _m = (0, react_1.useState)("type1"), peerContainerClass = _m[0], setPeerContainerClass = _m[1];
    var _o = (0, react_1.useState)(false), screenShareMode = _o[0], setScreenShareMode = _o[1];
    var roomId = (0, react_router_dom_1.useParams)().roomId;
    var _p = (0, react_1.useState)(false), openSettings = _p[0], setOpenSettings = _p[1];
    var _q = (0, react_1.useState)(null), selectedCamera = _q[0], setSelectedCamera = _q[1];
    var _r = (0, react_1.useState)(null), selectedMicrophone = _r[0], setSelectedMicrophone = _r[1];
    var _s = (0, react_1.useState)(localStorage.getItem(Constants.LSKEY_USERNAME) || "No name"), displayName = _s[0], setDisplayName = _s[1];
    var _t = (0, react_1.useState)(localStorage.getItem(Constants.LSKEY_USERNAME) || "No name"), tmpDisplayName = _t[0], setTmpDisplayName = _t[1];
    var _u = (0, react_1.useState)(false), editNameEnabled = _u[0], setEditNameEnabled = _u[1];
    var _v = (0, react_1.useState)({
        showVideo: false,
        showMicrophone: false,
        showName: false,
    }), modalState = _v[0], setModalState = _v[1];
    var _w = (0, react_1.useState)(false), ready = _w[0], setReady = _w[1];
    var peerId = localStorage.getItem(Constants.LSKEY_PEERID)
        ? localStorage.getItem(Constants.LSKEY_PEERID)
        : Utils_1.default.randomStr(8);
    if (!localStorage.getItem(Constants.LSKEY_PEERID))
        localStorage.setItem(Constants.LSKEY_PEERID, peerId);
    (0, react_1.useEffect)(function () {
        // load cameara and microphones
        (function () { return __awaiter(_this, void 0, void 0, function () {
            var defaultCamera, defaultMicrophone, cameras, selectedCameraDeviceId_1, camera, microphones, selectedMicrophoneDeviceId_1, microphone, spikaBroadcastClientLocal;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        defaultCamera = null;
                        defaultMicrophone = null;
                        return [4 /*yield*/, (0, SpikaBroadcastClient_1.getCameras)()];
                    case 1:
                        cameras = _a.sent();
                        if (cameras && cameras.length > 0) {
                            selectedCameraDeviceId_1 = localStorage.getItem(Constants.LSKEY_SELECTEDCAM);
                            if (selectedCameraDeviceId_1) {
                                camera = cameras.find(function (c) { return c.deviceId === selectedCameraDeviceId_1; });
                                defaultCamera = camera;
                                setSelectedCamera(camera);
                            }
                            else {
                                defaultCamera = cameras[0];
                                setSelectedCamera(cameras[0]);
                            }
                        }
                        return [4 /*yield*/, (0, SpikaBroadcastClient_1.getMicrophones)()];
                    case 2:
                        microphones = _a.sent();
                        if (microphones && microphones.length > 0) {
                            selectedMicrophoneDeviceId_1 = localStorage.getItem(Constants.LSKEY_SELECTEDMIC);
                            if (selectedMicrophoneDeviceId_1) {
                                microphone = microphones.find(function (m) { return m.deviceId === selectedMicrophoneDeviceId_1; });
                                defaultMicrophone = microphone;
                                setSelectedMicrophone(microphone);
                            }
                            else {
                                defaultMicrophone = microphones[0];
                                setSelectedMicrophone(microphones[0]);
                            }
                        }
                        spikaBroadcastClientLocal = new SpikaBroadcastClient_1.default({
                            debug: true,
                            host: CONFCALL_HOST,
                            port: CONFCALL_PORT,
                            roomId: "test",
                            peerId: Utils_1.default.randomStr(8),
                            displayName: localStorage.getItem(Constants.LSKEY_USERNAME) || "No name",
                            avatarUrl: "",
                            defaultCamera: defaultCamera,
                            defaultMicrophone: defaultMicrophone,
                            enableCamera: cameraEnabled,
                            enableMicrophone: micEnabled,
                            listener: {
                                onStartVideo: function (producer) {
                                    console.log("start video", producer);
                                    setWebcamProducer(producer);
                                },
                                onStartAudio: function (producer) {
                                    setMicrophoneProducer(producer);
                                },
                                onParticipantUpdate: function (participants) {
                                    var participantsAry = Array.from(participants, function (_a) {
                                        var key = _a[0], val = _a[1];
                                        return val;
                                    });
                                    setParticipants(participantsAry);
                                },
                                onMicrophoneStateChanged: function (state) {
                                    localStorage.setItem(Constants.LSKEY_MUTEMIC, state ? "1" : "0");
                                    setMicEnabled(state);
                                },
                                onCameraStateChanged: function (state) {
                                    localStorage.setItem(Constants.LSKEY_MUTECAM, state ? "1" : "0");
                                    setCameraEnabled(state);
                                },
                                onScreenShareStateChanged: function (state) {
                                    setScreenShareEnabled(state);
                                },
                                onStartShare: function (producer) {
                                    setScreenshareProducer(producer);
                                },
                                onSpeakerStateChanged: function () { },
                                onCallClosed: function () { },
                                onUpdateCameraDevice: function () { },
                                onUpdateMicrophoneDevice: function () { },
                                onUpdateSpeakerDevice: function () { },
                                onLogging: function (type, message) {
                                    if (typeof message !== "string")
                                        message = "<span class=\"small\">" + Utils_1.default.printObj(message) + "</span>";
                                    log.push({ time: (0, dayjs_1.default)().format("HH:mm"), type: type, message: message });
                                },
                                onJoined: function () {
                                    setReady(true);
                                },
                            },
                        });
                        spikaBroadcastClientLocal.connect();
                        setSpikabroadcastClient(spikaBroadcastClientLocal);
                        return [2 /*return*/];
                }
            });
        }); })();
        // save roomid
        localStorage.setItem(Constants.LSKEY_LASTROOM, roomId);
    }, []);
    (0, react_1.useEffect)(function () {
        if (!participants)
            return;
        var participantCount = participants.length;
        if (participantCount <= 1)
            setPeerContainerClass("type1");
        else if (participantCount <= 3)
            setPeerContainerClass("type2");
        else if (participantCount <= 5)
            setPeerContainerClass("type3");
        else
            setPeerContainerClass("type4");
        // handle screenshare logic
        var screenShareparticipant = participants.find(function (participant) {
            return participant.consumers.find(function (consumer) { return consumer.appData.share; });
        });
        var newScreenShareMode = screenShareparticipant !== undefined;
        if (screenShareMode !== newScreenShareMode && newScreenShareMode && screenShareEnabled) {
            console.log("going to disable screenshare");
            spikabroadcastClient.toggleScreenShare();
        }
        setScreenShareMode(newScreenShareMode);
    }, [participants]);
    (0, react_1.useEffect)(function () {
        if (spikabroadcastClient)
            spikabroadcastClient.changeDisplayName(displayName);
        setEditNameEnabled(false);
        localStorage.setItem(Constants.LSKEY_USERNAME, displayName);
    }, [displayName]);
    var consumerVideoElmInit = function (elm, i) {
        if (!participants || !participants[i] || !elm)
            return;
        var participant = participants[i];
        var consumers = participant.consumers;
        if (!consumers)
            return;
        var stream = new MediaStream();
        consumers.map(function (consumer) { return stream.addTrack(consumer.track); });
        elm.srcObject = stream;
        elm.play().catch(function (error) { return console.log(error); });
    };
    var close = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, spikabroadcastClient.disconnect()];
                case 1:
                    _a.sent();
                    if (onClose)
                        onClose();
                    return [2 /*return*/];
            }
        });
    }); };
    var updateDevice = function (camera, mic) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!camera) return [3 /*break*/, 2];
                    console.log("update camera", camera);
                    return [4 /*yield*/, spikabroadcastClient.updateCamera(camera)];
                case 1:
                    _a.sent();
                    localStorage.setItem(Constants.LSKEY_SELECTEDCAM, camera.deviceId);
                    _a.label = 2;
                case 2:
                    if (!mic) return [3 /*break*/, 4];
                    return [4 /*yield*/, spikabroadcastClient.updateMicrophone(mic)];
                case 3:
                    _a.sent();
                    localStorage.setItem(Constants.LSKEY_SELECTEDMIC, mic.deviceId);
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (react_1.default.createElement("div", { id: "spikabroadcast" },
        react_1.default.createElement("header", null),
        react_1.default.createElement("main", { className: "conference-main " + (screenShareMode || screenShareEnabled ? "screen-share" : "no-screen-share") },
            react_1.default.createElement("div", { className: "peers " + peerContainerClass },
                react_1.default.createElement("div", { className: "me" },
                    react_1.default.createElement(Me_1.default, { videoProducer: webcamProcuder, audioProducer: microphoneProducer }),
                    react_1.default.createElement("div", { className: "info", onClick: function (e) {
                            return setModalState(__assign(__assign({}, modalState), { showName: !modalState.showName }));
                        } }, displayName)),
                react_1.default.createElement(react_1.default.Fragment, null, participants
                    ? participants.map(function (participant, i) {
                        return (react_1.default.createElement("div", { className: "participant " + (participant.activeSpeaker ? "active" : ""), key: participant.id },
                            react_1.default.createElement(Peer_1.default, { participant: participant, key: participant.id })));
                    })
                    : null)),
            react_1.default.createElement(react_1.default.Fragment, null,
                participants
                    ? participants.map(function (participant, i) {
                        if (participant.consumers.find(function (consumer) {
                            return consumer.appData.share;
                        })) {
                            var videoTrackConsumer = participant.consumers.find(function (consumer) {
                                return consumer.appData.share;
                            });
                            return (react_1.default.createElement("div", { className: "screenshare", key: participant.id },
                                react_1.default.createElement(ScreenShareView_1.default, { videoTrack: videoTrackConsumer.track })));
                        }
                    })
                    : null,
                screenShareEnabled ? (react_1.default.createElement("div", { className: "screenshare" },
                    react_1.default.createElement(ScreenShareView_1.default, { videoTrack: screenShareProducer.track }))) : null),
            react_1.default.createElement("div", { className: "log" }, log.map(function (_a, index) {
                var time = _a.time, type = _a.type, message = _a.message;
                return (react_1.default.createElement("div", { className: type, key: index },
                    react_1.default.createElement("span", { className: "date" }, time),
                    react_1.default.createElement("span", { dangerouslySetInnerHTML: { __html: message } })));
            })),
            react_1.default.createElement("div", { className: "controlls" },
                react_1.default.createElement("ul", null,
                    ready ? (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement("li", { style: { width: "67px" } },
                            react_1.default.createElement("a", { className: "large_icon", onClick: function (e) { return spikabroadcastClient.toggleCamera(); } }, cameraEnabled ? (react_1.default.createElement("img", { src: camera_svg_1.default })) : (react_1.default.createElement("img", { src: cameraoff_svg_1.default })))),
                        react_1.default.createElement("li", { className: "setting-arrow", onClick: function (e) {
                                return setModalState(__assign(__assign({}, modalState), { showVideo: !modalState.showVideo }));
                            } },
                            react_1.default.createElement("img", { src: settingarrow_svg_1.default })),
                        react_1.default.createElement("li", { style: { width: "67px" } },
                            react_1.default.createElement("a", { className: "large_icon", onClick: function (e) { return spikabroadcastClient.toggleMicrophone(); } }, micEnabled ? (react_1.default.createElement("img", { src: mic_svg_1.default })) : (react_1.default.createElement("img", { src: micoff_svg_1.default })))),
                        react_1.default.createElement("li", { className: "setting-arrow", onClick: function (e) {
                                return setModalState(__assign(__assign({}, modalState), { showMicrophone: !modalState.showMicrophone }));
                            } },
                            react_1.default.createElement("img", { src: settingarrow_svg_1.default })),
                        react_1.default.createElement("li", null,
                            react_1.default.createElement("a", { className: "large_icon" },
                                react_1.default.createElement("img", { src: users_svg_1.default }))),
                        react_1.default.createElement("li", null,
                            react_1.default.createElement("a", { className: "large_icon", onClick: function (e) {
                                    if (screenShareMode) {
                                        if (confirm("Another use is sharing screen, do you want disable the current share ?"))
                                            return spikabroadcastClient.toggleScreenShare();
                                    }
                                    else {
                                    }
                                    spikabroadcastClient.toggleScreenShare();
                                } }, !screenShareEnabled ? (react_1.default.createElement("img", { src: screenshare_svg_1.default })) : (react_1.default.createElement("img", { src: screenshareoff_svg_1.default })))))) : null,
                    react_1.default.createElement("li", null,
                        react_1.default.createElement("a", { className: "button", onClick: function (e) { return close(); } },
                            react_1.default.createElement("img", { src: exit_svg_1.default })))))),
        react_1.default.createElement("footer", null),
        modalState.showVideo ? (react_1.default.createElement(VideoSelectorModal_1.default, { selectedDeviceId: selectedCamera ? selectedCamera.deviceId : "", onOK: function () {
                updateDevice(selectedCamera, selectedMicrophone);
                setModalState(__assign(__assign({}, modalState), { showVideo: !modalState.showVideo }));
            }, onClose: function () {
                return setModalState(__assign(__assign({}, modalState), { showVideo: !modalState.showVideo }));
            }, onChange: function (media) { return setSelectedCamera(media); } })) : null,
        modalState.showMicrophone ? (react_1.default.createElement(MicrophoneSelectorModal_1.default, { selectedDeviceId: selectedMicrophone ? selectedMicrophone.deviceId : "", onOK: function () {
                updateDevice(selectedCamera, selectedMicrophone);
                setModalState(__assign(__assign({}, modalState), { showMicrophone: !modalState.showMicrophone }));
            }, onClose: function () {
                return setModalState(__assign(__assign({}, modalState), { showMicrophone: !modalState.showMicrophone }));
            }, onChange: function (media) { return setSelectedMicrophone(media); } })) : null,
        modalState.showName ? (react_1.default.createElement(Modal_1.default, { title: "Set Display Name", onOK: function () {
                setDisplayName(tmpDisplayName);
                setModalState(__assign(__assign({}, modalState), { showName: !modalState.showName }));
            }, onClose: function () { return setModalState(__assign(__assign({}, modalState), { showName: !modalState.showName })); } },
            react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("input", { type: "text", value: tmpDisplayName, onChange: function (e) {
                        return setTmpDisplayName(e.currentTarget.value);
                    } }),
                " ",
                ":"))) : null));
}
exports.default = Conference;
//# sourceMappingURL=index.js.map