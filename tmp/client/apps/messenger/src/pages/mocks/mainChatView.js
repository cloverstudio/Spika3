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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var chatDetailsSidebar_1 = __importDefault(require("./chatDetailsSidebar"));
var chatInputBar_1 = __importDefault(require("./chatInputBar"));
var styles_1 = require("@mui/material/styles");
var Drawer_1 = __importDefault(require("@mui/material/Drawer"));
var IconButton_1 = __importDefault(require("@mui/material/IconButton"));
var ChevronLeft_1 = __importDefault(require("@mui/icons-material/ChevronLeft"));
var ChevronRight_1 = __importDefault(require("@mui/icons-material/ChevronRight"));
var drawerWidth = 400;
var Main = (0, styles_1.styled)("main", { shouldForwardProp: function (prop) { return prop !== "open"; } })(function (_a) {
    var theme = _a.theme, open = _a.open;
    return (__assign({ flexGrow: 1, padding: theme.spacing(3), transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }), marginRight: -drawerWidth }, (open && {
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: 0,
    })));
});
var DrawerHeader = (0, styles_1.styled)("div")(function (_a) {
    var theme = _a.theme;
    return (__assign(__assign({ display: "flex", alignItems: "center", padding: theme.spacing(0, 1) }, theme.mixins.toolbar), { justifyContent: "flex-start" }));
});
var theme = (0, styles_1.createTheme)({
    palette: {
        mode: "light",
    },
});
var MainChatView = function (props) {
    var _a = React.useState(false), open = _a[0], setOpen = _a[1];
    return (React.createElement(styles_1.ThemeProvider, { theme: theme },
        React.createElement(Main, { open: props.open },
            React.createElement(DrawerHeader, null),
            React.createElement(chatInputBar_1.default, null)),
        React.createElement(Drawer_1.default, { sx: {
                width: drawerWidth,
                flexShrink: { sm: 0 },
                "& .MuiDrawer-paper": {
                    width: drawerWidth,
                },
            }, variant: "persistent", anchor: "right", open: props.open },
            React.createElement(DrawerHeader, null,
                React.createElement(IconButton_1.default, { onClick: props.handleDrawerClose }, theme.direction === "rtl" ? React.createElement(ChevronLeft_1.default, null) : React.createElement(ChevronRight_1.default, null))),
            React.createElement(chatDetailsSidebar_1.default, null))));
};
exports.default = MainChatView;
//# sourceMappingURL=mainChatView.js.map