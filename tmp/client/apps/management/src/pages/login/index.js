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
var react_router_dom_1 = require("react-router-dom");
var material_1 = require("@mui/material");
var icons_material_1 = require("@mui/icons-material/");
var styles_1 = require("@mui/material/styles");
var react_redux_1 = require("react-redux");
var dayjs_1 = __importDefault(require("dayjs"));
var adminAuthSlice_1 = require("../../store/adminAuthSlice");
var useApi_1 = require("../../lib/useApi");
var snackBar_1 = __importDefault(require("../../components/snackBar"));
var useUI_1 = require("../../components/useUI");
function default_1() {
    var _this = this;
    var count = (0, react_redux_1.useSelector)(function (state) { return state.counter.value; });
    var dispatch = (0, react_redux_1.useDispatch)();
    var get = (0, useApi_1.useGet)();
    var post = (0, useApi_1.usePost)();
    var showSnackBar = (0, useUI_1.useShowSnackBar)();
    var localToken = "localToken";
    var history = (0, react_router_dom_1.useHistory)();
    var _a = react_1.default.useState(true), rememberMe = _a[0], setRememberMe = _a[1];
    (0, react_1.useEffect)(function () {
        (function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!rememberMe) return [3 /*break*/, 2];
                        return [4 /*yield*/, checkToken()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); })();
    }, []);
    var checkToken = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, check, authToken, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, get("/api/management/auth/check")];
                case 1:
                    response = _a.sent();
                    check = JSON.parse(response);
                    authToken = localStorage.getItem(localToken);
                    if (check && authToken != null && authToken.length != 0) {
                        history.push("/dashboard");
                    }
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    console.error(e_1);
                    showSnackBar({ severity: "error", text: "Token expired" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleChange = function (event) {
        setRememberMe(event.target.checked);
    };
    var handleSubmit = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var formdata, username, password, loginResult, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    formdata = event.target;
                    username = formdata.username.value;
                    password = formdata.password.value;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, post("/api/management/auth", {
                            username: username,
                            password: password,
                        })];
                case 2:
                    loginResult = _a.sent();
                    if (loginResult.token) {
                        if (rememberMe) {
                            localStorage.setItem(localToken, loginResult.token);
                        }
                        dispatch((0, adminAuthSlice_1.login)({
                            token: loginResult.token,
                            username: username,
                            expireDate: dayjs_1.default.unix(loginResult.expireDate).toDate(),
                        }));
                        showSnackBar({ severity: "success", text: "Signed In" });
                        history.push("/dashboard");
                    }
                    else {
                        showSnackBar({ severity: "error", text: "Failed to signin" });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    showSnackBar({ severity: "error", text: "Failed to signin" });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var theme = (0, styles_1.createTheme)({
        palette: {
            mode: "light",
        },
    });
    return (react_1.default.createElement(styles_1.ThemeProvider, { theme: theme },
        react_1.default.createElement(material_1.Container, { component: "main", maxWidth: "xs" },
            react_1.default.createElement(material_1.CssBaseline, null),
            react_1.default.createElement(material_1.Box, { sx: {
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                } },
                react_1.default.createElement(material_1.Avatar, { sx: { m: 1, bgcolor: "secondary.main" } },
                    react_1.default.createElement(icons_material_1.LockOutlined, null)),
                react_1.default.createElement(material_1.Typography, { component: "h1", variant: "h5" }, "Spika3 Admin"),
                react_1.default.createElement(material_1.Box, { component: "form", onSubmit: handleSubmit, noValidate: true, sx: { mt: 1 } },
                    react_1.default.createElement(material_1.TextField, { margin: "normal", required: true, fullWidth: true, id: "username", label: "Admin User Name", name: "username", autoComplete: "username", autoFocus: true }),
                    react_1.default.createElement(material_1.TextField, { margin: "normal", required: true, fullWidth: true, name: "password", label: "Admin Password", type: "password", id: "password", autoComplete: "current-password" }),
                    react_1.default.createElement(material_1.FormControlLabel, { control: react_1.default.createElement(material_1.Checkbox, { checked: rememberMe, onChange: handleChange }), label: "Remember me" }),
                    react_1.default.createElement(material_1.Button, { type: "submit", fullWidth: true, variant: "contained", sx: { mt: 3, mb: 2 } }, "Sign In"))),
            react_1.default.createElement(snackBar_1.default, null))));
}
exports.default = default_1;
//# sourceMappingURL=index.js.map