"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var styles_1 = require("@mui/material/styles");
var material_1 = require("@mui/material");
var CircleTwoTone_1 = __importDefault(require("@mui/icons-material/CircleTwoTone"));
var CallOutlined_1 = __importDefault(require("@mui/icons-material/CallOutlined"));
var VideocamOutlined_1 = __importDefault(require("@mui/icons-material/VideocamOutlined"));
var VolumeOffOutlined_1 = __importDefault(require("@mui/icons-material/VolumeOffOutlined"));
var MoreHorizOutlined_1 = __importDefault(require("@mui/icons-material/MoreHorizOutlined"));
var Add_1 = __importDefault(require("@mui/icons-material/Add"));
var theme = (0, styles_1.createTheme)({
    palette: {
        mode: "light",
    },
});
var ChatDetailsSidebar = function () {
    return (react_1.default.createElement(styles_1.ThemeProvider, { theme: theme },
        react_1.default.createElement(material_1.Box, { margin: "15px", borderRadius: 10, flexGrow: 1, bgcolor: "#f2f2f2" },
            react_1.default.createElement(material_1.Box, { margin: "15px", flexGrow: 1, position: "relative" },
                react_1.default.createElement(material_1.Avatar, { alt: "Remy Sharp", src: "../../../../../../documents/pages/login_robot_image.svg" }),
                react_1.default.createElement(material_1.Box, { fontSize: "15px", fontWeight: 500 },
                    react_1.default.createElement("label", null, "Group work and stuff")),
                react_1.default.createElement(material_1.Box, { margin: "15px", flexGrow: 1, position: "relative" },
                    react_1.default.createElement(material_1.Stack, { alignItems: "center", spacing: 1, direction: "row" },
                        react_1.default.createElement(material_1.IconButton, null,
                            react_1.default.createElement(CircleTwoTone_1.default, { style: { color: "red" } })),
                        react_1.default.createElement(material_1.IconButton, null,
                            react_1.default.createElement(CircleTwoTone_1.default, { style: { color: "green" } })),
                        react_1.default.createElement(material_1.IconButton, null,
                            react_1.default.createElement(CircleTwoTone_1.default, { style: { color: "yellow" } })),
                        react_1.default.createElement(material_1.IconButton, null,
                            react_1.default.createElement(CircleTwoTone_1.default, { style: { color: "blue" } })))),
                react_1.default.createElement(material_1.Box, { margin: "5px", flexGrow: 1, position: "relative" },
                    react_1.default.createElement(material_1.Stack, { alignItems: "center", direction: "row" },
                        react_1.default.createElement(material_1.IconButton, { sx: {
                                padding: 2,
                                backgroundColor: "#4696f0",
                                borderRadius: 1,
                                margin: 1,
                            } },
                            react_1.default.createElement(material_1.Box, null,
                                react_1.default.createElement(CallOutlined_1.default, { style: { color: "white" } }),
                                react_1.default.createElement(material_1.Box, { color: "white", fontSize: "12px" },
                                    react_1.default.createElement("label", null, "Audio")))),
                        react_1.default.createElement(material_1.IconButton, { sx: {
                                padding: 2,
                                backgroundColor: "#4696f0",
                                borderRadius: 1,
                                margin: 1,
                            } },
                            react_1.default.createElement(material_1.Box, null,
                                react_1.default.createElement(VideocamOutlined_1.default, { style: { color: "white" } }),
                                react_1.default.createElement(material_1.Box, { color: "white", fontSize: "12px" },
                                    react_1.default.createElement("label", null, "Video")))),
                        react_1.default.createElement(material_1.IconButton, { sx: {
                                padding: 2,
                                backgroundColor: "#131940",
                                borderRadius: 1,
                                margin: 1,
                            } },
                            react_1.default.createElement(material_1.Box, null,
                                react_1.default.createElement(VolumeOffOutlined_1.default, { style: { color: "white" } }),
                                react_1.default.createElement(material_1.Box, { color: "white", fontSize: "12px" },
                                    react_1.default.createElement("label", null, "Mute")))),
                        react_1.default.createElement(material_1.IconButton, { sx: {
                                padding: 2,
                                backgroundColor: "#131940",
                                borderRadius: 1,
                                margin: 1,
                            } },
                            react_1.default.createElement(material_1.Box, null,
                                react_1.default.createElement(MoreHorizOutlined_1.default, { style: { color: "white" } }),
                                react_1.default.createElement(material_1.Box, { color: "white", fontSize: "12px" },
                                    react_1.default.createElement("label", null, "More")))))),
                react_1.default.createElement(material_1.Box, null,
                    react_1.default.createElement(material_1.Box, { fontSize: "15px", fontWeight: 500 },
                        react_1.default.createElement("label", null, " Call history")),
                    react_1.default.createElement(material_1.Box, { fontSize: "12px", color: "grey" },
                        react_1.default.createElement("label", null, "No call history yet..."))),
                react_1.default.createElement(material_1.Box, null,
                    react_1.default.createElement(material_1.Box, null,
                        react_1.default.createElement(material_1.Stack, { alignItems: "center", spacing: 1, direction: "row", margin: "0.5em", sx: { borderRadius: 1 } },
                            react_1.default.createElement(material_1.Box, { fontSize: "15px", fontWeight: 500 },
                                react_1.default.createElement("label", null, "Notes")),
                            react_1.default.createElement(material_1.IconButton, { style: { textAlign: "right" }, sx: { color: "#4696f0", borderRadius: 1, padding: 1 } },
                                react_1.default.createElement(material_1.Stack, { alignItems: "center", spacing: 1, direction: "row" },
                                    react_1.default.createElement(Add_1.default, { style: { fill: "white" } }),
                                    react_1.default.createElement("label", { style: { fontSize: 14, color: "white" } }, "Add new"))))),
                    react_1.default.createElement(material_1.Box, { fontSize: "12px", color: "grey" },
                        react_1.default.createElement("label", null, "There are no notes so far..."))),
                react_1.default.createElement(material_1.Box, null,
                    react_1.default.createElement(material_1.Box, { fontSize: "15px", fontWeight: 500 },
                        react_1.default.createElement("label", null, "Favorites")),
                    react_1.default.createElement(material_1.Box, { fontSize: "12px", color: "grey" },
                        react_1.default.createElement("label", null, "You haven\u2019t favorited any message so far...."))),
                react_1.default.createElement(material_1.Box, null,
                    react_1.default.createElement(material_1.Box, { fontSize: "15px", fontWeight: 500 },
                        react_1.default.createElement("label", null, "Shared media")),
                    react_1.default.createElement(material_1.Box, { fontSize: "12px", color: "grey" },
                        react_1.default.createElement("label", null, "There is no media shared so far...")))))));
};
exports.default = ChatDetailsSidebar;
//# sourceMappingURL=chatDetailsSidebar.js.map