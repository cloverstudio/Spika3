"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const ArrowRightAlt_1 = __importDefault(require("@mui/icons-material/ArrowRightAlt"));
const react_router_dom_1 = require("react-router-dom");
function UserList({ users }) {
    return (react_1.default.createElement(material_1.Box, { maxWidth: "21rem" }, users.map((user) => (react_1.default.createElement(User, { id: user.id, key: user.id, name: user.displayName, avatarFileId: user.avatarFileId, telephoneNumber: user.telephoneNumber })))));
}
exports.default = UserList;
function User({ name, id, avatarFileId, telephoneNumber, }) {
    return (react_1.default.createElement(react_router_dom_1.Link, { to: `/users/${id}`, style: { textDecoration: "none" } },
        react_1.default.createElement(material_1.Box, { display: "flex", color: "text.primary", p: 1, sx: {
                cursor: "pointer",
                "&:hover": {
                    backgroundColor: "background.paper",
                },
            } },
            react_1.default.createElement(material_1.Avatar, { sx: { width: 50, height: 50 }, alt: name || "U", src: `${UPLOADS_BASE_URL}/${avatarFileId}` }),
            react_1.default.createElement(material_1.Box, { ml: 2, display: "flex", flexGrow: 1, justifyContent: "space-between", alignItems: "center" },
                react_1.default.createElement(material_1.Box, null,
                    react_1.default.createElement(material_1.Typography, { fontWeight: "500" }, name || "{name}"),
                    react_1.default.createElement(material_1.Typography, { fontWeight: "400", fontSize: "0.8rem" }, telephoneNumber)),
                react_1.default.createElement(ArrowRightAlt_1.default, { sx: { ml: "auto" } })))));
}
exports.User = User;
//# sourceMappingURL=UserList.js.map