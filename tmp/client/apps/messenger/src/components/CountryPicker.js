"use strict";
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
var material_1 = require("@mui/material");
var styles_1 = require("@mui/material/styles");
var icons_material_1 = require("@mui/icons-material");
var styles_2 = require("@mui/styles");
var react_window_1 = require("react-window");
var countries_1 = __importDefault(require("../../../../lib/countries"));
var libphonenumber_js_1 = require("libphonenumber-js");
var theme = (0, styles_1.createTheme)({
    palette: {
        mode: "light",
    },
});
var useStyles = (0, styles_2.makeStyles)(function () { return ({
    noBorder: {
        border: "none",
    },
}); });
var CountryPicker = function (props) {
    var classes = useStyles();
    var _a = react_1.default.useState(""), searchText = _a[0], setSearchText = _a[1];
    var _b = react_1.default.useState(countries_1.default), tempCountries = _b[0], setTempCountries = _b[1];
    var _c = react_1.default.useState("1"), countryCode = _c[0], setCountryCode = _c[1];
    var _d = react_1.default.useState(false), openMenu = _d[0], setOpenMenu = _d[1];
    var _e = react_1.default.useState(null), staticBoxCoordinates = _e[0], setStaticBoxCoordinates = _e[1];
    var handleSearch = function (event) {
        setSearchText(event.target.value);
    };
    var handlePhoneNumber = function (event) {
        props.phoneNum(event.target.value);
        var checkPhone = "+" + countryCode + event.target.value;
        props.validation((0, libphonenumber_js_1.isValidPhoneNumber)(checkPhone));
    };
    var handleListItemClick = function (event, index) {
        setCountryCode(tempCountries[index].phone);
        props.code(tempCountries[index].phone);
        setOpenMenu(!openMenu);
    };
    var handleOpen = function () {
        setOpenMenu(!openMenu);
    };
    var inputRef = (0, react_1.useRef)(null);
    function renderRow(props) {
        var index = props.index, style = props.style;
        return (react_1.default.createElement(material_1.ListItem, { style: style, key: index, component: "div", disablePadding: true, secondaryAction: react_1.default.createElement(material_1.Typography, { color: "#9AA0A6" },
                "+",
                tempCountries[index].phone) },
            react_1.default.createElement(material_1.ListItemButton, { onClick: function (event) { return handleListItemClick(event, index); } },
                react_1.default.createElement("img", { loading: "lazy", width: "20", src: "https://flagcdn.com/w20/" + tempCountries[index].code.toLowerCase() + ".png", srcSet: "https://flagcdn.com/w40/" + tempCountries[index].code.toLowerCase() + ".png 2x", alt: "" }),
                react_1.default.createElement(material_1.ListItemText, { sx: { marginLeft: 1 }, primary: tempCountries[index].label }))));
    }
    (0, react_1.useEffect)(function () {
        setStaticBoxCoordinates(inputRef.current.getBoundingClientRect());
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, filterCountries(searchText)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [searchText]);
    var filterCountries = function (search) { return __awaiter(void 0, void 0, void 0, function () {
        var filter;
        return __generator(this, function (_a) {
            filter = countries_1.default.filter(function (country) {
                return country.label.toLowerCase().includes(search.toLowerCase()) ||
                    country.phone.includes(search);
            });
            setTempCountries(filter);
            return [2 /*return*/];
        });
    }); };
    return (react_1.default.createElement(styles_1.ThemeProvider, { theme: theme },
        react_1.default.createElement("div", { ref: inputRef, style: { width: "100%" } },
            react_1.default.createElement(material_1.Box, { sx: {
                    border: "solid",
                    borderWidth: "1px",
                    borderColor: "lightgray",
                    borderRadius: 1,
                    padding: "0.5em",
                    width: "100%",
                } },
                react_1.default.createElement(material_1.Stack, { justifyContent: "center", alignItems: "center", spacing: 2, direction: "row" },
                    react_1.default.createElement(material_1.Button, { onClick: function () { return handleOpen(); } },
                        react_1.default.createElement(material_1.Typography, { color: "#0288d1" },
                            " +",
                            countryCode),
                        !openMenu ? (react_1.default.createElement(icons_material_1.KeyboardArrowDown, { color: "info" })) : (react_1.default.createElement(icons_material_1.KeyboardArrowUp, { color: "info" }))),
                    react_1.default.createElement(material_1.Divider, { orientation: "vertical", flexItem: true }),
                    react_1.default.createElement(material_1.TextField, { variant: "outlined", margin: "normal", required: true, fullWidth: true, autoFocus: true, size: "small", placeholder: "Eg. 98334234", InputProps: {
                            classes: { notchedOutline: classes.noBorder },
                        }, onChange: handlePhoneNumber })),
                openMenu ? (react_1.default.createElement(material_1.Box, { sx: {
                        position: "absolute",
                        backgroundColor: "white",
                        zIndex: 10,
                        width: staticBoxCoordinates.width,
                        left: staticBoxCoordinates.left,
                        padding: "0.5em",
                        borderStyle: "none solid solid solid",
                        borderWidth: "1px",
                        borderColor: "lightgray",
                        borderRadius: 1,
                    } },
                    react_1.default.createElement(material_1.TextField, { variant: "outlined", fullWidth: true, autoFocus: true, sx: {
                            backgroundColor: "#F2F2F2",
                            borderRadius: "1em",
                            marginTop: "1.0em",
                            marginBottom: "2em",
                        }, value: searchText, onChange: handleSearch, placeholder: "Search", InputProps: {
                            startAdornment: (react_1.default.createElement(material_1.InputAdornment, { position: "start" },
                                react_1.default.createElement(icons_material_1.Search, null))),
                            classes: { notchedOutline: classes.noBorder },
                        }, inputProps: {
                            style: {
                                padding: 10,
                            },
                        } }),
                    react_1.default.createElement(material_1.Typography, { color: "#9AA0A6", marginLeft: "1em" }, "ALL COUNTRIES"),
                    react_1.default.createElement(react_window_1.FixedSizeList, { height: 200, width: "100%", itemSize: 46, itemCount: tempCountries.length, overscanCount: 5 }, renderRow))) : (react_1.default.createElement(material_1.Box, null))))));
};
exports.default = CountryPicker;
//# sourceMappingURL=CountryPicker.js.map