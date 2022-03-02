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
var x_data_grid_1 = require("@mui/x-data-grid");
var material_1 = require("@mui/material");
var icons_material_1 = require("@mui/icons-material/");
var useApi_1 = require("../../lib/useApi");
var useUI_1 = require("../../components/useUI");
var styles_1 = require("@mui/material/styles");
var styles_2 = require("@material-ui/styles");
var defaultTheme = (0, styles_1.createTheme)();
var useStyles = (0, styles_2.makeStyles)(
    function (theme) {
        var getBackgroundColor = function (color) {
            return theme.palette.mode === "dark"
                ? (0, styles_1.darken)(color, 0.6)
                : (0, styles_1.lighten)(color, 0.6);
        };
        var getHoverBackgroundColor = function (color) {
            return theme.palette.mode === "dark"
                ? (0, styles_1.darken)(color, 0.5)
                : (0, styles_1.lighten)(color, 0.5);
        };
        return {
            root: {
                "& .super-app-theme--true": {
                    backgroundColor: getBackgroundColor(theme.palette.info.main),
                    "&:hover": {
                        backgroundColor: getHoverBackgroundColor(theme.palette.info.main),
                    },
                },
                "& .super-app-theme--false": {
                    backgroundColor: getBackgroundColor(theme.palette.success.main),
                    "&:hover": {
                        backgroundColor: getHoverBackgroundColor(theme.palette.success.main),
                    },
                },
            },
        };
    },
    { defaultTheme: defaultTheme }
);
function Room() {
    var _this = this;
    var _a = react_1.default.useState(false),
        loading = _a[0],
        setLoading = _a[1];
    var _b = react_1.default.useState([]),
        list = _b[0],
        setList = _b[1];
    var _c = react_1.default.useState(30),
        pageSize = _c[0],
        setPageSize = _c[1];
    var _d = react_1.default.useState(0),
        totalCount = _d[0],
        setTotalCount = _d[1];
    var _e = react_1.default.useState(false),
        deleteFilter = _e[0],
        setDeleteFilter = _e[1];
    var urlParams = (0, react_router_dom_1.useParams)();
    var showSnackBar = (0, useUI_1.useShowSnackBar)();
    var history = (0, react_router_dom_1.useHistory)();
    var get = (0, useApi_1.useGet)();
    var classes = useStyles();
    (0, react_1.useEffect)(
        function () {
            (function () {
                return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                return [4 /*yield*/, fetchData(0)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                });
            })();
        },
        [deleteFilter]
    );
    var fetchData = function (page) {
        return __awaiter(_this, void 0, void 0, function () {
            var url, response, data, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setLoading(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        url = "";
                        if (!deleteFilter) {
                            url =
                                urlParams.userId == null
                                    ? "/management/room?page=" + page
                                    : "/management/room?page=" +
                                      page +
                                      "&userId=" +
                                      urlParams.userId;
                        } else {
                            url =
                                urlParams.userId == null
                                    ? "/management/room?page=" + page + "&deleted=" + deleteFilter
                                    : "/management/room?page=" +
                                      page +
                                      "&userId=" +
                                      urlParams.userId +
                                      "&deleted=" +
                                      deleteFilter;
                        }
                        return [4 /*yield*/, get(url)];
                    case 2:
                        response = _a.sent();
                        data = response.data;
                        setList(data.list);
                        setPageSize(data.limit);
                        setTotalCount(data.count);
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.error(e_1);
                        showSnackBar({
                            severity: "error",
                            text: "Server error, please check browser console.",
                        });
                        return [3 /*break*/, 4];
                    case 4:
                        setLoading(false);
                        return [2 /*return*/];
                }
            });
        });
    };
    var columns = [
        { field: "id", headerName: "ID", flex: 0.2, sortable: false, filterable: false },
        {
            field: "avatarUrl",
            headerName: "Avatar",
            flex: 0.3,
            sortable: false,
            filterable: false,
            renderCell: function (params) {
                return react_1.default.createElement(
                    "strong",
                    null,
                    react_1.default.createElement(material_1.Avatar, {
                        alt: "Remy Sharp",
                        src: params.value,
                    })
                );
            },
        },
        {
            field: "name",
            headerName: "Name",
            flex: 1,
            minWidth: 300,
            sortable: false,
            filterable: false,
        },
        {
            field: "type",
            headerName: "Type",
            flex: 0.5,
            sortable: false,
            filterable: false,
        },
        {
            field: "deleted",
            headerName: "Deleted",
            type: "boolean",
            flex: 0.5,
            sortable: false,
            filterable: false,
            renderCell: function (params) {
                return react_1.default.createElement(
                    "strong",
                    null,
                    !params.value
                        ? ""
                        : react_1.default.createElement(
                              icons_material_1.CheckCircleOutlineOutlined,
                              { style: { fill: "red" } }
                          )
                );
            },
        },
        {
            field: "createdAt",
            headerName: "Created",
            type: "dateTime",
            flex: 0.5,
            sortable: false,
            filterable: false,
        },
        {
            field: "modifiedAt",
            headerName: "Modified",
            type: "dateTime",
            flex: 0.5,
            sortable: false,
            filterable: false,
        },
        {
            field: "actions",
            type: "actions",
            width: 80,
            getActions: function (params) {
                return [
                    react_1.default.createElement(x_data_grid_1.GridActionsCellItem, {
                        icon: react_1.default.createElement(icons_material_1.Description, null),
                        label: "Detail",
                        onClick: function () {
                            return history.push("/room/detail/" + params.id);
                        },
                        showInMenu: true,
                    }),
                    react_1.default.createElement(x_data_grid_1.GridActionsCellItem, {
                        icon: react_1.default.createElement(icons_material_1.Edit, null),
                        label: "Edit",
                        onClick: function () {
                            return history.push("/room/edit/" + params.id);
                        },
                        showInMenu: true,
                    }),
                    react_1.default.createElement(x_data_grid_1.GridActionsCellItem, {
                        icon: react_1.default.createElement(icons_material_1.Delete, null),
                        label: "Delete",
                        onClick: function () {
                            return history.push("/room/delete/" + params.id);
                        },
                        showInMenu: true,
                    }),
                ];
            },
        },
    ];
    return react_1.default.createElement(
        layout_1.default,
        { subtitle: "Rooms" },
        react_1.default.createElement(
            material_1.Paper,
            {
                sx: {
                    margin: "24px",
                    padding: "24px",
                },
            },
            react_1.default.createElement(
                material_1.FormGroup,
                null,
                react_1.default.createElement(material_1.FormControlLabel, {
                    label: "Only Deleted",
                    control: react_1.default.createElement(material_1.Checkbox, {
                        checked: deleteFilter,
                        onChange: function (e) {
                            setDeleteFilter(e.target.checked);
                        },
                    }),
                })
            ),
            react_1.default.createElement(
                "div",
                { style: { display: "flex", width: "100%", flexGrow: 1 }, className: classes.root },
                react_1.default.createElement(x_data_grid_1.DataGrid, {
                    autoHeight: true,
                    rows: list,
                    columns: columns,
                    pageSize: pageSize,
                    rowCount: totalCount,
                    pagination: true,
                    paginationMode: "server",
                    onPageChange: function (newPage) {
                        return fetchData(newPage);
                    },
                    loading: loading,
                    getRowClassName: function (params) {
                        return "super-app-theme--" + params.getValue(params.id, "deleted");
                    },
                })
            )
        ),
        react_1.default.createElement(
            material_1.Fab,
            {
                color: "primary",
                "aria-label": "add",
                sx: { position: "absolute", right: 64, bottom: 128, zIndex: 100 },
                onClick: function (e) {
                    history.push("/room/add");
                },
            },
            react_1.default.createElement(icons_material_1.Add, null)
        )
    );
}
exports.default = Room;
//# sourceMappingURL=index.js.map
