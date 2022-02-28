"use strict";
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                      return m[k];
                  },
              });
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
          });
var __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
        ? function (o, v) {
              Object.defineProperty(o, "default", { enumerable: true, value: v });
          }
        : function (o, v) {
              o["default"] = v;
          });
var __importStar =
    (this && this.__importStar) ||
    function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
var __generator =
    (this && this.__generator) ||
    function (thisArg, body) {
        var _ = {
                label: 0,
                sent: function () {
                    if (t[0] & 1) throw t[1];
                    return t[1];
                },
                trys: [],
                ops: [],
            },
            f,
            y,
            t,
            g;
        return (
            (g = { next: verb(0), throw: verb(1), return: verb(2) }),
            typeof Symbol === "function" &&
                (g[Symbol.iterator] = function () {
                    return this;
                }),
            g
        );
        function verb(n) {
            return function (v) {
                return step([n, v]);
            };
        }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (
                        ((f = 1),
                        y &&
                            (t =
                                op[0] & 2
                                    ? y["return"]
                                    : op[0]
                                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                                    : y.next) &&
                            !(t = t.call(y, op[1])).done)
                    )
                        return t;
                    if (((y = 0), t)) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (
                                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                                (op[0] === 6 || op[0] === 2)
                            ) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2]) _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) {
                    op = [6, e];
                    y = 0;
                } finally {
                    f = t = 0;
                }
            if (op[0] & 5) throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var layout_1 = __importDefault(require("../layout"));
var react_router_dom_1 = require("react-router-dom");
var useApi_1 = require("../../lib/useApi");
var material_1 = require("@mui/material");
var useUI_1 = require("../../components/useUI");
var yup = __importStar(require("yup"));
var formik_1 = require("formik");
var deviceModelSchema = yup.object({
    userId: yup.number().required("User id is required"),
    deviceId: yup.string().required("Device id is required"),
    type: yup.string(),
    osName: yup.string(),
    appVersion: yup.number(),
    token: yup.string(),
    pushToken: yup.string(),
});
function Page() {
    var _this = this;
    var urlParams = (0, react_router_dom_1.useParams)();
    var history = (0, react_router_dom_1.useHistory)();
    var showSnackBar = (0, useUI_1.useShowSnackBar)();
    var get = (0, useApi_1.useGet)();
    var put = (0, useApi_1.usePut)();
    var formik = (0, formik_1.useFormik)({
        initialValues: {
            userId: "",
            deviceId: "",
            type: "",
            osName: "",
            appVersion: "",
            token: "",
            pushToken: "",
        },
        validationSchema: deviceModelSchema,
        onSubmit: function (values) {
            validateAndUpdate();
        },
    });
    var serverDevice = (0, formik_1.useFormik)({
        initialValues: {
            id: 0,
            userId: "",
            deviceId: "",
            type: "",
            osName: "",
            appVersion: "",
            token: "",
            pushToken: "",
        },
        validationSchema: deviceModelSchema,
        onSubmit: function (values) {},
    });
    (0, react_1.useEffect)(function () {
        (function () {
            return __awaiter(_this, void 0, void 0, function () {
                var serverResponse,
                    response,
                    checkUId,
                    checkDId,
                    checkType,
                    checkOsName,
                    checkAppVersion,
                    checkToken,
                    checkPushToken,
                    e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, get("/management/device/" + urlParams.id)];
                        case 1:
                            serverResponse = _a.sent();
                            response = serverResponse.data.device;
                            checkUId = response.userId == null ? "" : response.userId;
                            checkDId = response.deviceId == null ? "" : response.deviceId;
                            checkType = response.type == null ? "" : response.type;
                            checkOsName = response.osName == null ? "" : response.osName;
                            checkAppVersion =
                                response.appVersion == null ? "" : response.appVersion;
                            checkToken = response.token == null ? "" : response.token;
                            checkPushToken = response.pushToken == null ? "" : response.pushToken;
                            formik.setValues({
                                userId: String(checkUId),
                                deviceId: checkDId,
                                type: checkType,
                                osName: checkOsName,
                                appVersion: String(checkAppVersion),
                                token: checkToken,
                                pushToken: checkPushToken,
                            });
                            serverDevice.setValues({
                                id: response.id,
                                userId: String(checkUId),
                                deviceId: checkDId,
                                type: checkType,
                                osName: checkOsName,
                                appVersion: String(checkAppVersion),
                                token: checkToken,
                                pushToken: checkPushToken,
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            e_1 = _a.sent();
                            console.error(e_1);
                            showSnackBar({
                                severity: "error",
                                text: "Server error, please check browser console.",
                            });
                            return [3 /*break*/, 3];
                        case 3:
                            return [2 /*return*/];
                    }
                });
            });
        })();
    }, []);
    var validateAndUpdate = function () {
        return __awaiter(_this, void 0, void 0, function () {
            var result, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [
                            4 /*yield*/,
                            put("/management/device/" + urlParams.id, {
                                id: serverDevice.values.id,
                                userId: formik.values.userId,
                                deviceId: formik.values.deviceId,
                                type: formik.values.type,
                                osName: formik.values.osName,
                                appVersion: formik.values.appVersion,
                                token: formik.values.token,
                                pushToken: formik.values.pushToken,
                            }),
                        ];
                    case 1:
                        result = _a.sent();
                        showSnackBar({ severity: "success", text: "Device updated" });
                        history.push("/device");
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        console.error(e_2);
                        showSnackBar({
                            severity: "error",
                            text: String(e_2.message),
                        });
                        return [3 /*break*/, 3];
                    case 3:
                        return [2 /*return*/];
                }
            });
        });
    };
    return react_1.default.createElement(
        layout_1.default,
        { subtitle: "Device detail ( " + urlParams.id + " )", showBack: true },
        react_1.default.createElement(
            "form",
            { onSubmit: formik.handleSubmit },
            react_1.default.createElement(
                material_1.Paper,
                {
                    sx: {
                        margin: "24px",
                        padding: "24px",
                        minHeight: "calc(100vh-64px)",
                    },
                },
                react_1.default.createElement(
                    material_1.Grid,
                    { container: true, spacing: 2 },
                    react_1.default.createElement(
                        material_1.Grid,
                        { item: true, xs: 12, md: 8 },
                        react_1.default.createElement(material_1.TextField, {
                            required: true,
                            fullWidth: true,
                            id: "userId",
                            error: formik.touched.userId && Boolean(formik.errors.userId),
                            label: "User Id",
                            value: formik.values.userId,
                            onChange: formik.handleChange,
                            helperText: formik.touched.userId && formik.errors.userId,
                        })
                    ),
                    react_1.default.createElement(
                        material_1.Grid,
                        { item: true, xs: 12, md: 8 },
                        react_1.default.createElement(material_1.TextField, {
                            required: true,
                            fullWidth: true,
                            id: "deviceId",
                            error: formik.touched.deviceId && Boolean(formik.errors.deviceId),
                            label: "Device Id",
                            value: formik.values.deviceId,
                            onChange: formik.handleChange,
                            helperText: formik.touched.deviceId && formik.errors.deviceId,
                        })
                    ),
                    react_1.default.createElement(
                        material_1.Grid,
                        { item: true, xs: 12, md: 8 },
                        react_1.default.createElement(material_1.TextField, {
                            fullWidth: true,
                            id: "type",
                            error: formik.touched.type && Boolean(formik.errors.type),
                            label: "Type",
                            value: formik.values.type,
                            onChange: formik.handleChange,
                            helperText: formik.touched.type && formik.errors.type,
                        })
                    ),
                    react_1.default.createElement(
                        material_1.Grid,
                        { item: true, xs: 12, md: 8 },
                        react_1.default.createElement(material_1.TextField, {
                            fullWidth: true,
                            id: "osName",
                            error: formik.touched.osName && Boolean(formik.errors.osName),
                            label: "Os Name",
                            value: formik.values.osName,
                            onChange: formik.handleChange,
                            helperText: formik.touched.osName && formik.errors.osName,
                        })
                    ),
                    react_1.default.createElement(
                        material_1.Grid,
                        { item: true, xs: 12, md: 8 },
                        react_1.default.createElement(material_1.TextField, {
                            fullWidth: true,
                            id: "appVersion",
                            error: formik.touched.appVersion && Boolean(formik.errors.appVersion),
                            label: "App version",
                            value: formik.values.appVersion,
                            onChange: formik.handleChange,
                            helperText: formik.touched.appVersion && formik.errors.appVersion,
                        })
                    ),
                    react_1.default.createElement(
                        material_1.Grid,
                        { item: true, xs: 12, md: 8 },
                        react_1.default.createElement(material_1.TextField, {
                            fullWidth: true,
                            id: "token",
                            error: formik.touched.token && Boolean(formik.errors.token),
                            label: "Token",
                            value: formik.values.token,
                            onChange: formik.handleChange,
                            helperText: formik.touched.token && formik.errors.token,
                        })
                    ),
                    react_1.default.createElement(
                        material_1.Grid,
                        { item: true, xs: 12, md: 8 },
                        react_1.default.createElement(material_1.TextField, {
                            fullWidth: true,
                            id: "pushToken",
                            error: formik.touched.pushToken && Boolean(formik.errors.pushToken),
                            label: "Push token",
                            value: formik.values.pushToken,
                            onChange: formik.handleChange,
                            helperText: formik.touched.pushToken && formik.errors.pushToken,
                        })
                    ),
                    react_1.default.createElement(
                        material_1.Grid,
                        { item: true, xs: 12, md: 8, textAlign: "right" },
                        react_1.default.createElement(
                            material_1.Button,
                            { variant: "contained", type: "submit" },
                            "Update device"
                        )
                    )
                )
            )
        )
    );
}
exports.default = Page;
//# sourceMappingURL=edit.js.map
