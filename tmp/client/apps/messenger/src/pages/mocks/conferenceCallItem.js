"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var material_1 = require("@mui/material");
var icons_material_1 = require("@mui/icons-material");
var ConferenceCallItem = function (props) {
    var participant = props.participant;
    var handleCamera = function () { };
    var handleMic = function () { };
    return (react_1.default.createElement(material_1.Box, { sx: {
            width: "100%",
            height: "100%",
            backgroundColor: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "1em",
            position: "relative",
            "&:hover .overlay": {
                display: "block",
            },
        } },
        react_1.default.createElement(material_1.Typography, { color: "white" }, participant.user.displayName),
        react_1.default.createElement(material_1.Box, { sx: {
                bottom: 0,
                left: 0,
                position: "absolute",
                width: "100%",
                height: "100%",
                display: "none",
            }, className: "overlay" },
            react_1.default.createElement(material_1.Box, { sx: {
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                } },
                react_1.default.createElement(material_1.Box, { sx: {
                        bottom: 0,
                        position: "absolute",
                        width: "60%",
                        height: "10%",
                        backgroundColor: "white",
                        opacity: 0.3,
                        left: "50%",
                        transform: "translate(-50%, 0%)",
                    } }),
                react_1.default.createElement(material_1.Box, { sx: {
                        bottom: 0,
                        position: "absolute",
                        width: "60%",
                        height: "10%",
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                        left: "50%",
                        transform: "translate(-50%, 0%)",
                        zIndex: 10,
                    } },
                    react_1.default.createElement(material_1.Typography, { color: "white" }, participant.user.displayName)),
                react_1.default.createElement(material_1.Box, { sx: {
                        bottom: 0,
                        position: "absolute",
                        width: "20%",
                        height: "10%",
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                        left: "73%",
                        transform: "translate(-50%, 0%)",
                        zIndex: 10,
                    } },
                    react_1.default.createElement(material_1.Stack, { direction: "row", alignItems: "right", spacing: 1, sx: { display: "flex", flexDirection: "row", justifyContent: "right" } },
                        react_1.default.createElement(material_1.Tooltip, { title: "No Video" },
                            react_1.default.createElement(material_1.IconButton, { sx: { padding: 0 }, onClick: handleCamera },
                                react_1.default.createElement(icons_material_1.Videocam, { style: { fill: "white" } }))),
                        react_1.default.createElement(material_1.Tooltip, { title: "Mute" },
                            react_1.default.createElement(material_1.IconButton, { sx: { padding: 0 }, onClick: handleMic },
                                react_1.default.createElement(icons_material_1.Mic, { style: { fill: "white" } })))))))));
};
exports.default = ConferenceCallItem;
//# sourceMappingURL=conferenceCallItem.js.map