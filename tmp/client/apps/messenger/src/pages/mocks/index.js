"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_router_dom_1 = require("react-router-dom");
var material_1 = require("@mui/material");
var icons_material_1 = require("@mui/icons-material");
var styles_1 = require("@mui/material/styles");
var theme = (0, styles_1.createTheme)({
    palette: {
        mode: "light",
    },
});
function default_1() {
    var history = (0, react_router_dom_1.useHistory)();
    return (react_1.default.createElement(styles_1.ThemeProvider, { theme: theme },
        react_1.default.createElement(material_1.Container, { component: "main", maxWidth: "xs" },
            react_1.default.createElement(material_1.List, { sx: { width: "100%", maxWidth: 360, bgcolor: "background.paper" }, component: "nav", "aria-labelledby": "nested-list-subheader", subheader: react_1.default.createElement(material_1.ListSubheader, { component: "div", id: "nested-list-subheader" }, "Mockups") },
                react_1.default.createElement(material_1.ListItemButton, { onClick: function (e) { return history.push("/mock/chat"); } },
                    react_1.default.createElement(material_1.ListItemIcon, null,
                        react_1.default.createElement(icons_material_1.ContactPageOutlined, null)),
                    react_1.default.createElement(material_1.ListItemText, { primary: "Chat" })),
                react_1.default.createElement(material_1.ListItemButton, { onClick: function (e) { return history.push("/mock/chat_nomessage_userlist"); } },
                    react_1.default.createElement(material_1.ListItemIcon, null,
                        react_1.default.createElement(icons_material_1.ContactPageOutlined, null)),
                    react_1.default.createElement(material_1.ListItemText, { primary: "Userlist" })),
                react_1.default.createElement(material_1.ListItemButton, { onClick: function (e) { return history.push("/mock/chat_medialist"); } },
                    react_1.default.createElement(material_1.ListItemIcon, null,
                        react_1.default.createElement(icons_material_1.ContactPageOutlined, null)),
                    react_1.default.createElement(material_1.ListItemText, { primary: "Chat Media" })),
                react_1.default.createElement(material_1.ListItemButton, { onClick: function (e) { return history.push("/mock/nochat"); } },
                    react_1.default.createElement(material_1.ListItemIcon, null,
                        react_1.default.createElement(icons_material_1.ContactPageOutlined, null)),
                    react_1.default.createElement(material_1.ListItemText, { primary: "No Chat" })),
                react_1.default.createElement(material_1.ListItemButton, { onClick: function (e) { return history.push("/mock/chat_medialist"); } },
                    react_1.default.createElement(material_1.ListItemIcon, null,
                        react_1.default.createElement(icons_material_1.ContactPageOutlined, null)),
                    react_1.default.createElement(material_1.ListItemText, { primary: "Chat Media List" })),
                react_1.default.createElement(material_1.ListItemButton, { onClick: function (e) { return history.push("/mock/chat_nomessage_userlist"); } },
                    react_1.default.createElement(material_1.ListItemIcon, null,
                        react_1.default.createElement(icons_material_1.ContactPageOutlined, null)),
                    react_1.default.createElement(material_1.ListItemText, { primary: "Chat No messages User list" })),
                react_1.default.createElement(material_1.ListItemButton, { onClick: function (e) { return history.push("/mock/chat_small_sidebar"); } },
                    react_1.default.createElement(material_1.ListItemIcon, null,
                        react_1.default.createElement(icons_material_1.ContactPageOutlined, null)),
                    react_1.default.createElement(material_1.ListItemText, { primary: "Chat Small Sidebar" })),
                react_1.default.createElement(material_1.ListItemButton, { onClick: function (e) { return history.push("/mock/chat_nomessage"); } },
                    react_1.default.createElement(material_1.ListItemIcon, null,
                        react_1.default.createElement(icons_material_1.ContactPageOutlined, null)),
                    react_1.default.createElement(material_1.ListItemText, { primary: "No Messages" })),
                react_1.default.createElement(material_1.ListItemButton, { onClick: function (e) { return history.push("/mock/nochat"); } },
                    react_1.default.createElement(material_1.ListItemIcon, null,
                        react_1.default.createElement(icons_material_1.ContactPageOutlined, null)),
                    react_1.default.createElement(material_1.ListItemText, { primary: "No Chat" })),
                react_1.default.createElement(material_1.ListItemButton, { onClick: function (e) { return history.push("/mock/conferenceCallView"); } },
                    react_1.default.createElement(material_1.ListItemIcon, null,
                        react_1.default.createElement(icons_material_1.ContactPageOutlined, null)),
                    react_1.default.createElement(material_1.ListItemText, { primary: "Conference call (Vedran)" })),
                react_1.default.createElement(material_1.ListItemButton, { onClick: function (e) { return history.push("/mock/confcall"); } },
                    react_1.default.createElement(material_1.ListItemIcon, null,
                        react_1.default.createElement(icons_material_1.ContactPageOutlined, null)),
                    react_1.default.createElement(material_1.ListItemText, { primary: "Conference call" }))))));
}
exports.default = default_1;
//# sourceMappingURL=index.js.map