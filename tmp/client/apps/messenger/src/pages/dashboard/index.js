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
var react_router_dom_1 = require("react-router-dom");
var material_1 = require("@mui/material");
var react_redux_1 = require("react-redux");
var adminAuthSlice_1 = require("../../store/adminAuthSlice");
var AppBar_1 = __importDefault(require("@mui/material/AppBar"));
var icons_material_1 = require("@mui/icons-material/");
var styles_1 = require("@mui/material/styles");
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
function default_1() {
    var token = (0, react_redux_1.useSelector)(function (state) { return state.auth.token; });
    var dispatch = (0, react_redux_1.useDispatch)();
    var history = (0, react_router_dom_1.useHistory)();
    var _a = react_1.default.useState(true), open = _a[0], setOpen = _a[1];
    var toggleDrawer = function () {
        setOpen(!open);
    };
    var theme = (0, styles_1.createTheme)({
        palette: {
            mode: "light",
        },
    });
    function Copyright(props) {
        return (react_1.default.createElement(material_1.Typography, __assign({ variant: "body2", color: "text.secondary", align: "center" }, props),
            "Copyright © ",
            react_1.default.createElement(material_1.Link, { color: "inherit", href: "https://material-ui.com/" }, "Your Website"),
            " ",
            new Date().getFullYear(),
            "."));
    }
    return (react_1.default.createElement(styles_1.ThemeProvider, { theme: theme },
        react_1.default.createElement(material_1.Box, { sx: { display: "flex" } },
            react_1.default.createElement(material_1.CssBaseline, null),
            react_1.default.createElement(AppBar, { position: "absolute", open: open },
                react_1.default.createElement(material_1.Toolbar, { sx: {
                        pr: "24px", // keep right padding when drawer closed
                    } },
                    react_1.default.createElement(material_1.IconButton, { edge: "start", color: "inherit", "aria-label": "open drawer", onClick: toggleDrawer, sx: __assign({ marginRight: "36px" }, (open && { display: "none" })) },
                        react_1.default.createElement(icons_material_1.Menu, null)),
                    react_1.default.createElement(material_1.Typography, { component: "h1", variant: "h6", color: "inherit", noWrap: true, sx: { flexGrow: 1 } },
                        "Dashboard",
                        token),
                    react_1.default.createElement(material_1.IconButton, { color: "inherit" },
                        react_1.default.createElement(material_1.Badge, { badgeContent: 4, color: "secondary" },
                            react_1.default.createElement(icons_material_1.Notifications, null))))),
            react_1.default.createElement(material_1.Drawer, { variant: "permanent", open: open },
                react_1.default.createElement(material_1.Toolbar, { sx: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        px: [1],
                    } },
                    react_1.default.createElement(material_1.IconButton, { onClick: toggleDrawer },
                        react_1.default.createElement(icons_material_1.ChevronLeft, null)))),
            react_1.default.createElement(material_1.Box, { component: "main", sx: {
                    backgroundColor: function (theme) {
                        return theme.palette.mode === "light"
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900];
                    },
                    flexGrow: 1,
                    height: "100vh",
                    overflow: "auto",
                } },
                react_1.default.createElement(material_1.Toolbar, null),
                react_1.default.createElement(material_1.Container, { maxWidth: "lg", sx: { mt: 4, mb: 4 } },
                    react_1.default.createElement(material_1.Grid, { container: true, spacing: 3 },
                        react_1.default.createElement(material_1.Grid, { item: true, xs: 12, md: 8, lg: 9 },
                            react_1.default.createElement(material_1.Paper, { sx: {
                                    p: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    height: 240,
                                } }, token)),
                        react_1.default.createElement(material_1.Grid, { item: true, xs: 12, md: 4, lg: 3 },
                            react_1.default.createElement(material_1.Paper, { sx: {
                                    p: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    height: 240,
                                } },
                                react_1.default.createElement(material_1.Button, { onClick: function (e) {
                                        dispatch((0, adminAuthSlice_1.logout)());
                                        history.push("/");
                                    } }, "Logout"))),
                        react_1.default.createElement(material_1.Grid, { item: true, xs: 12 }, token)),
                    react_1.default.createElement(Copyright, { sx: { pt: 4 } }))))));
}
exports.default = default_1;
//# sourceMappingURL=index.js.map