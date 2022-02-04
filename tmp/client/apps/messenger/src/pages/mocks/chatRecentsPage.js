"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var material_1 = require("@mui/material");
var login_logo_svg_1 = __importDefault(require("../../../../../../documents/pages/login_logo.svg"));
var styles_1 = require("@mui/material/styles");
var IconButton_1 = __importDefault(require("@mui/material/IconButton"));
var Search_1 = __importDefault(require("@mui/icons-material/Search"));
var icons_material_1 = require("@mui/icons-material");
var Folder_1 = __importDefault(require("@mui/icons-material/Folder"));
var theme = (0, styles_1.createTheme)({
    palette: {
        mode: "light",
    },
});
function generate(element) {
    return [0, 1, 2].map(function (value) {
        return react_1.default.cloneElement(element, {
            key: value,
        });
    });
}
var ChatRecentsPage = function () {
    var _a = react_1.default.useState(false), dense = _a[0], setDense = _a[1];
    var _b = react_1.default.useState("left"), recentState = _b[0], setRecentState = _b[1];
    var handleRecentState = function (event, newState) {
        setRecentState(newState);
    };
    return (react_1.default.createElement(styles_1.ThemeProvider, { theme: theme },
        react_1.default.createElement(material_1.Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", spacing: 2, width: "100%", paddingTop: "1rem", sx: { borderBottom: 1, borderColor: "lightGrey", paddingBottom: 1.5 } },
            react_1.default.createElement(material_1.Box, { ml: "1em", component: "img", width: "50px", height: "50px", display: "flex", src: login_logo_svg_1.default }),
            react_1.default.createElement(material_1.Stack, { direction: "row", alignItems: "center", spacing: 1, pr: "2em" },
                react_1.default.createElement(material_1.Avatar, { alt: "Remy Sharp", src: "../../../../../../documents/pages/login_robot_image.svg" }),
                react_1.default.createElement(IconButton_1.default, { sx: { marginLeft: 1 } },
                    react_1.default.createElement(icons_material_1.Settings, null)),
                react_1.default.createElement(IconButton_1.default, null,
                    react_1.default.createElement(icons_material_1.DriveFileRenameOutlineOutlined, null)))),
        react_1.default.createElement(material_1.ToggleButtonGroup, { color: "info", size: "large", value: recentState, exclusive: true, onChange: handleRecentState, "aria-label": "text alignment", sx: { p: "1.5em", justifyContent: "space-between" } },
            react_1.default.createElement(material_1.ToggleButton, { value: "left", "aria-label": "left aligned", sx: { border: 0 } },
                react_1.default.createElement(icons_material_1.Message, null)),
            react_1.default.createElement(material_1.ToggleButton, { value: "center", "aria-label": "centered", sx: { border: 0 } },
                react_1.default.createElement(icons_material_1.Call, null)),
            react_1.default.createElement(material_1.ToggleButton, { value: "right", "aria-label": "right aligned", sx: { border: 0 } },
                react_1.default.createElement(icons_material_1.AccountCircle, null))),
        react_1.default.createElement(material_1.Box, { sx: { display: "flex", alignItems: "flex-end", paddingBottom: 1 }, ml: "1em", mr: "1em", bgcolor: "lightGray", borderRadius: "1em" },
            react_1.default.createElement(Search_1.default, { sx: { color: "action.active", ml: 1, mr: 1, my: 0.5 } }),
            react_1.default.createElement(material_1.TextField, { id: "searchInput", label: "Search", variant: "standard", sx: { width: "85%" }, InputProps: { disableUnderline: true } })),
        react_1.default.createElement(material_1.Box, { margin: "1em", marginTop: "0", borderRadius: 1 },
            react_1.default.createElement(material_1.List, { dense: dense }, generate(react_1.default.createElement(material_1.ListItem, null,
                react_1.default.createElement(material_1.ListItemSecondaryAction, { sx: { top: "40%" } },
                    react_1.default.createElement(material_1.Typography, { fontSize: "0.75em" }, "10:30")),
                react_1.default.createElement(material_1.ListItemAvatar, null,
                    react_1.default.createElement(material_1.Avatar, null,
                        react_1.default.createElement(Folder_1.default, null))),
                react_1.default.createElement(material_1.ListItemText, { primary: "Matej Vida", secondary: "Kaze da moze sada" })))))));
};
exports.default = ChatRecentsPage;
//# sourceMappingURL=chatRecentsPage.js.map