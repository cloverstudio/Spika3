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
var styles_1 = require("@mui/material/styles");
var Box_1 = __importDefault(require("@mui/material/Box"));
var CssBaseline_1 = __importDefault(require("@mui/material/CssBaseline"));
var Drawer_1 = __importDefault(require("@mui/material/Drawer"));
var IconButton_1 = __importDefault(require("@mui/material/IconButton"));
var Toolbar_1 = __importDefault(require("@mui/material/Toolbar"));
var AppBar_1 = __importDefault(require("@mui/material/AppBar"));
var chatRecentsPage_1 = __importDefault(require("./chatRecentsPage"));
var KeyboardArrowDown_1 = __importDefault(require("@mui/icons-material/KeyboardArrowDown"));
var mainChatView_1 = __importDefault(require("./mainChatView"));
var material_1 = require("@mui/material");
var icons_material_1 = require("@mui/icons-material");
var drawerWidth = 400;
var DrawerHeader = (0, styles_1.styled)("div")(function (_a) {
    var theme = _a.theme;
    return (__assign(__assign({ display: "flex", alignItems: "center", padding: theme.spacing(0, 1) }, theme.mixins.toolbar), { justifyContent: "flex-start" }));
});
var AppBar = (0, styles_1.styled)(AppBar_1.default, {
    shouldForwardProp: function (prop) { return prop !== "open"; },
})(function (_a) {
    var theme = _a.theme, open = _a.open;
    return (__assign({ transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }) }, (open && {
        width: "calc(100% - " + drawerWidth + "px)",
        transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: drawerWidth,
    })));
});
function ResponsiveDrawer() {
    // const { window } = props;
    var _a = React.useState(false), mobileOpen = _a[0], setMobileOpen = _a[1];
    var _b = React.useState(false), open = _b[0], setOpen = _b[1];
    var theme = (0, styles_1.useTheme)();
    var handleDrawerToggle = function () {
        setMobileOpen(!mobileOpen);
        console.log("clickToggle");
    };
    var handleDrawerOpen = function () {
        console.log("click");
        setOpen(true);
    };
    var handleDrawerClose = function () {
        setOpen(false);
    };
    // const container = window !== undefined ? () => window().document.body : undefined;
    return (React.createElement(Box_1.default, { sx: { display: "flex" } },
        React.createElement(CssBaseline_1.default, null),
        React.createElement(AppBar, { position: "fixed", sx: {
                width: { sm: "calc(100% - " + drawerWidth + "px)" },
                right: "auto",
                ml: { sm: drawerWidth + "px" },
                boxShadow: "none",
                paddingTop: "0.9rem",
                backgroundColor: "white",
                borderBottom: 1,
                borderColor: "lightgray",
            }, open: open },
            React.createElement(Toolbar_1.default, null,
                React.createElement(IconButton_1.default, { color: "inherit", "aria-label": "open drawer", edge: "start", onClick: handleDrawerToggle, sx: { mr: 2, display: { sm: "none" } } },
                    React.createElement(KeyboardArrowDown_1.default, null)),
                React.createElement(material_1.Avatar, { alt: "Remy Sharp", src: "../../../../../../documents/pages/login_robot_image.svg" }),
                React.createElement(Box_1.default, { sx: { flexGrow: 1 }, color: "black", pl: "1em" }, "Matej Vida"),
                React.createElement(material_1.Stack, { direction: "row", alignItems: "center", spacing: 1, pr: "2em" },
                    React.createElement(IconButton_1.default, null,
                        React.createElement(icons_material_1.Videocam, { color: "info" })),
                    React.createElement(IconButton_1.default, null,
                        React.createElement(icons_material_1.Call, { color: "info" })),
                    React.createElement(IconButton_1.default, null,
                        React.createElement(icons_material_1.Search, { color: "info" }))),
                React.createElement(IconButton_1.default, { color: "inherit", "aria-label": "open drawer", edge: "end", onClick: handleDrawerOpen, sx: __assign({}, (open && { display: "none" })) },
                    React.createElement(KeyboardArrowDown_1.default, null)))),
        React.createElement(Box_1.default, { component: "nav", sx: { width: { sm: drawerWidth }, flexShrink: { sm: 0 } } },
            React.createElement(Drawer_1.default
            // container={container}
            , { 
                // container={container}
                variant: "temporary", open: mobileOpen, onClose: handleDrawerToggle, ModalProps: {
                    keepMounted: true, // Better open performance on mobile.
                }, sx: {
                    display: { xs: "block", sm: "none" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: drawerWidth,
                    },
                } },
                React.createElement(chatRecentsPage_1.default, null)),
            React.createElement(Drawer_1.default, { variant: "permanent", sx: {
                    display: { xs: "none", sm: "block" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: drawerWidth,
                    },
                }, open: true },
                React.createElement(chatRecentsPage_1.default, null))),
        React.createElement(mainChatView_1.default, { open: open, handleDrawerClose: handleDrawerClose })));
}
// ResponsiveDrawer.propTypes = {
//   /**
//    * Injected by the documentation to work in an iframe.
//    * You won't need it on your project.
//    */
//   window: PropTypes.func,
// };
exports.default = ResponsiveDrawer;
//# sourceMappingURL=chat.js.map