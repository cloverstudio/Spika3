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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var styles_1 = require("@mui/material/styles");
var Drawer_1 = __importDefault(require("@mui/material/Drawer"));
var AppBar_1 = __importDefault(require("@mui/material/AppBar"));
var react_router_dom_1 = require("react-router-dom");
var material_1 = require("@mui/material");
var icons_material_1 = require("@mui/icons-material/");
var snackBar_1 = __importDefault(require("../components/snackBar"));
var basicDialog_1 = __importDefault(require("../components/basicDialog"));
var adminAuthSlice_1 = require("../store/adminAuthSlice");
var uiSlice_1 = require("../store/uiSlice");
var react_redux_1 = require("react-redux");
var drawerWidth = 240;
var AppBar = (0, styles_1.styled)(AppBar_1.default, {
    shouldForwardProp: function (prop) { return prop !== "open"; },
})(function (_a) {
    var theme = _a.theme, open = _a.open;
    return (__assign({ zIndex: theme.zIndex.drawer + 1, transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }) }, (open && {
        marginLeft: drawerWidth,
        width: "calc(100% - " + drawerWidth + "px)",
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    })));
});
var Drawer = (0, styles_1.styled)(Drawer_1.default, {
    shouldForwardProp: function (prop) { return prop !== "open"; },
})(function (_a) {
    var _b;
    var theme = _a.theme, open = _a.open;
    return ({
        "& .MuiDrawer-paper": __assign({ position: "relative", whiteSpace: "nowrap", width: drawerWidth, transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }), boxSizing: "border-box" }, (!open && (_b = {
                overflowX: "hidden",
                transition: theme.transitions.create("width", {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7)
            },
            _b[theme.breakpoints.up("sm")] = {
                width: theme.spacing(9),
            },
            _b))),
    });
});
var mdTheme = (0, styles_1.createTheme)();
var localToken = "localToken";
function DashboardContent(_a) {
    var subtitle = _a.subtitle, children = _a.children, _b = _a.showBack, showBack = _b === void 0 ? false : _b;
    var dispatch = (0, react_redux_1.useDispatch)();
    var history = (0, react_router_dom_1.useHistory)();
    var _c = react_1.default.useState(true), open = _c[0], setOpen = _c[1];
    var toggleDrawer = function () {
        setOpen(!open);
    };
    return (react_1.default.createElement(styles_1.ThemeProvider, { theme: mdTheme },
        react_1.default.createElement(material_1.Box, { sx: { display: "flex" } },
            react_1.default.createElement(material_1.CssBaseline, null),
            react_1.default.createElement(AppBar, { position: "absolute", open: open },
                react_1.default.createElement(material_1.Toolbar, { sx: {
                        pr: "24px", // keep right padding when drawer closed
                    } },
                    react_1.default.createElement(material_1.IconButton, { edge: "start", color: "inherit", "aria-label": "open drawer", onClick: toggleDrawer, sx: __assign({ marginRight: "36px" }, (open && { display: "none" })) },
                        react_1.default.createElement(icons_material_1.Menu, null)),
                    showBack ? (react_1.default.createElement(material_1.IconButton, { color: "inherit", onClick: function (e) {
                            history.goBack();
                        } },
                        react_1.default.createElement(icons_material_1.ArrowBackIos, null))) : null,
                    react_1.default.createElement(material_1.Typography, { component: "h1", variant: "h6", color: "inherit", noWrap: true, sx: { flexGrow: 1 } }, subtitle),
                    react_1.default.createElement(material_1.IconButton, { color: "inherit" },
                        react_1.default.createElement(material_1.Badge, { badgeContent: 4, color: "secondary" },
                            react_1.default.createElement(icons_material_1.Notifications, null))))),
            react_1.default.createElement(Drawer, { variant: "permanent", open: open },
                react_1.default.createElement(material_1.Toolbar, { sx: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        px: [1],
                    } },
                    react_1.default.createElement(material_1.IconButton, { onClick: toggleDrawer },
                        react_1.default.createElement(icons_material_1.ChevronLeft, null))),
                react_1.default.createElement(material_1.Divider, null),
                react_1.default.createElement(material_1.List, null,
                    react_1.default.createElement(material_1.ListItem, { button: true, onClick: function (e) {
                            history.push("/dashboard");
                        } },
                        react_1.default.createElement(material_1.ListItemIcon, null,
                            react_1.default.createElement(icons_material_1.Dashboard, null)),
                        react_1.default.createElement(material_1.ListItemText, { primary: "Dashboard" })),
                    react_1.default.createElement(material_1.ListItem, { button: true, onClick: function (e) {
                            history.push("/user");
                        } },
                        react_1.default.createElement(material_1.ListItemIcon, null,
                            react_1.default.createElement(icons_material_1.Person, null)),
                        react_1.default.createElement(material_1.ListItemText, { primary: "Users" })),
                    react_1.default.createElement(material_1.ListItem, { button: true, onClick: function (e) {
                            history.push("/device");
                        } },
                        react_1.default.createElement(material_1.ListItemIcon, null,
                            react_1.default.createElement(icons_material_1.Devices, null)),
                        react_1.default.createElement(material_1.ListItemText, { primary: "Devices" })),
                    react_1.default.createElement(material_1.ListItem, { button: true, onClick: function (e) {
                            history.push("/room");
                        } },
                        react_1.default.createElement(material_1.ListItemIcon, null,
                            react_1.default.createElement(icons_material_1.MeetingRoom, null)),
                        react_1.default.createElement(material_1.ListItemText, { primary: "Rooms" }))),
                react_1.default.createElement(material_1.Divider, null),
                react_1.default.createElement(material_1.List, null,
                    react_1.default.createElement(material_1.ListItem, { button: true, onClick: function (e) {
                            dispatch((0, adminAuthSlice_1.logout)());
                            dispatch((0, uiSlice_1.showSnackBar)({
                                severity: "success",
                                text: "Singed out",
                            }));
                            localStorage.removeItem(localToken);
                            history.push("/");
                        } },
                        react_1.default.createElement(material_1.ListItemIcon, null,
                            react_1.default.createElement(icons_material_1.Logout, null)),
                        react_1.default.createElement(material_1.ListItemText, { primary: "Logout" })))),
            react_1.default.createElement(material_1.Box, { component: "main", sx: {
                    backgroundColor: function (theme) {
                        return theme.palette.mode === "light"
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900];
                    },
                    flexGrow: 1,
                    height: "100vh",
                    overflow: "auto",
                    paddingTop: "64px",
                } }, children)),
        react_1.default.createElement(snackBar_1.default, null),
        react_1.default.createElement(basicDialog_1.default, null)));
}
function Dashboard(props) {
    return react_1.default.createElement(DashboardContent, __assign({}, props));
}
exports.default = Dashboard;
//# sourceMappingURL=layout.js.map