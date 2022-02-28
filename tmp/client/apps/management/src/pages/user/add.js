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
var react_1 = __importDefault(require("react"));
var layout_1 = __importDefault(require("../layout"));
var react_router_dom_1 = require("react-router-dom");
var useApi_1 = require("../../lib/useApi");
var material_1 = require("@mui/material");
var useUI_1 = require("../../components/useUI");
var yup = __importStar(require("yup"));
var formik_1 = require("formik");
var userModelSchema = yup.object({
    displayName: yup.string().required("Display name is required"),
    telephoneNumber: yup
        .number()
        .required("Telephone number is required")
        .typeError("Numbers only!"),
    email: yup.string().required("Email is required").email("Not valid email"),
    avatarUrl: yup.string().url(),
    verified: yup.boolean(),
});
function Dashboard() {
    var _this = this;
    var history = (0, react_router_dom_1.useHistory)();
    var showSnackBar = (0, useUI_1.useShowSnackBar)();
    var formik = (0, formik_1.useFormik)({
        initialValues: {
            displayName: "",
            telephoneNumber: "",
            email: "",
            avatarUrl: "",
            verified: false,
        },
        validationSchema: userModelSchema,
        onSubmit: function (values) {
            validateAndAdd();
        },
    });
    var _a = react_1.default.useState(false),
        verified = _a[0],
        setVerified = _a[1];
    var handleChange = function (event) {
        setVerified(event.target.checked);
    };
    var post = (0, useApi_1.usePost)();
    var validateAndAdd = function () {
        return __awaiter(_this, void 0, void 0, function () {
            var result, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [
                            4 /*yield*/,
                            post("/management/user", {
                                displayName: formik.values.displayName,
                                emailAddress: formik.values.email,
                                telephoneNumber: formik.values.telephoneNumber,
                                avatarUrl: formik.values.avatarUrl,
                                verified: formik.values.verified,
                            }),
                        ];
                    case 1:
                        result = _a.sent();
                        showSnackBar({ severity: "success", text: "User added" });
                        history.push("/user");
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        showSnackBar({
                            severity: "error",
                            text: String(e_1.message),
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
        { subtitle: "Add new user", showBack: true },
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
                            id: "displayName",
                            error: formik.touched.displayName && Boolean(formik.errors.displayName),
                            label: "Display Name",
                            value: formik.values.displayName,
                            onChange: formik.handleChange,
                            helperText: formik.touched.displayName && formik.errors.displayName,
                        })
                    ),
                    react_1.default.createElement(
                        material_1.Grid,
                        { item: true, xs: 12, md: 8 },
                        react_1.default.createElement(
                            material_1.Stack,
                            { alignItems: "center", spacing: 1, direction: "row" },
                            react_1.default.createElement(material_1.TextField, {
                                required: true,
                                fullWidth: true,
                                id: "telephoneNumber",
                                error:
                                    formik.touched.telephoneNumber &&
                                    Boolean(formik.errors.telephoneNumber),
                                label: "Phone number",
                                value: formik.values.telephoneNumber,
                                onChange: formik.handleChange,
                                helperText:
                                    formik.touched.telephoneNumber && formik.errors.telephoneNumber,
                            })
                        )
                    ),
                    react_1.default.createElement(
                        material_1.Grid,
                        { item: true, xs: 12, md: 8 },
                        react_1.default.createElement(material_1.TextField, {
                            fullWidth: true,
                            required: true,
                            id: "email",
                            error: formik.touched.email && Boolean(formik.errors.email),
                            label: "E-mail",
                            value: formik.values.email,
                            onChange: formik.handleChange,
                            helperText: formik.touched.email && formik.errors.email,
                        })
                    ),
                    react_1.default.createElement(
                        material_1.Grid,
                        { item: true, xs: 12, md: 8 },
                        react_1.default.createElement(material_1.TextField, {
                            fullWidth: true,
                            id: "telephoneNumber",
                            error: formik.touched.avatarUrl && Boolean(formik.errors.avatarUrl),
                            label: "Avatar Url",
                            value: formik.values.avatarUrl,
                            onChange: formik.handleChange,
                            helperText: formik.touched.avatarUrl && formik.errors.avatarUrl,
                        })
                    ),
                    react_1.default.createElement(
                        material_1.Grid,
                        { item: true, xs: 12, md: 8 },
                        react_1.default.createElement(
                            material_1.FormControl,
                            { component: "fieldset" },
                            react_1.default.createElement(
                                material_1.FormGroup,
                                { "aria-label": "position", row: true },
                                react_1.default.createElement(material_1.FormControlLabel, {
                                    value: "start",
                                    control: react_1.default.createElement(material_1.Checkbox, {
                                        id: "verified",
                                        onChange: formik.handleChange,
                                    }),
                                    label: "Verified",
                                    labelPlacement: "start",
                                })
                            )
                        )
                    ),
                    react_1.default.createElement(
                        material_1.Grid,
                        { item: true, xs: 12, md: 8, textAlign: "right" },
                        react_1.default.createElement(
                            material_1.Button,
                            { variant: "contained", type: "submit" },
                            "Add new user"
                        )
                    )
                )
            )
        )
    );
}
exports.default = Dashboard;
//# sourceMappingURL=add.js.map
