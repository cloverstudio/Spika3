"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var styles_1 = require("@mui/material/styles");
var material_1 = require("@mui/material");
var IconButton_1 = __importDefault(require("@mui/material/IconButton"));
var AccountCircleRounded_1 = __importDefault(require("@mui/icons-material/AccountCircleRounded"));
var Image_1 = __importDefault(require("@mui/icons-material/Image"));
var MovieCreation_1 = __importDefault(require("@mui/icons-material/MovieCreation"));
var Headphones_1 = __importDefault(require("@mui/icons-material/Headphones"));
var PictureAsPdf_1 = __importDefault(require("@mui/icons-material/PictureAsPdf"));
var Description_1 = __importDefault(require("@mui/icons-material/Description"));
var InsertDriveFile_1 = __importDefault(require("@mui/icons-material/InsertDriveFile"));
var Link_1 = __importDefault(require("@mui/icons-material/Link"));
var FindInPage_1 = __importDefault(require("@mui/icons-material/FindInPage"));
var theme = (0, styles_1.createTheme)({
    palette: {
        mode: "light",
    },
});
var ChatTopBar = function () {
    return (react_1.default.createElement(styles_1.ThemeProvider, { theme: theme },
        react_1.default.createElement(material_1.Box, { sx: { flexGrow: 1 } },
            react_1.default.createElement(material_1.Stack, { alignItems: "center", spacing: 5, direction: "row" },
                react_1.default.createElement(material_1.Box, null,
                    react_1.default.createElement(material_1.Stack, { alignItems: "center", spacing: 1, direction: "row" },
                        react_1.default.createElement(IconButton_1.default, null,
                            react_1.default.createElement(material_1.Stack, { alignItems: "center", spacing: 1, direction: "row" },
                                react_1.default.createElement(AccountCircleRounded_1.default, { style: { width: 20, height: 20 } }),
                                react_1.default.createElement("label", { style: { fontSize: 12 } }, " 16 "))))),
                react_1.default.createElement(material_1.Box, null,
                    react_1.default.createElement(material_1.Stack, { alignItems: "center", spacing: 1, direction: "row" },
                        react_1.default.createElement("label", { style: { fontSize: 12, color: "grey" } }, " Media: "),
                        react_1.default.createElement(IconButton_1.default, null,
                            react_1.default.createElement(material_1.Stack, { alignItems: "center", spacing: 1, direction: "row" },
                                react_1.default.createElement(Image_1.default, { style: { width: 20, height: 20 } }),
                                react_1.default.createElement("label", { style: { fontSize: 12 } }, " 16 "))),
                        react_1.default.createElement(IconButton_1.default, null,
                            react_1.default.createElement(material_1.Stack, { alignItems: "center", spacing: 1, direction: "row" },
                                react_1.default.createElement(MovieCreation_1.default, { style: { width: 20, height: 20 } }),
                                react_1.default.createElement("label", { style: { fontSize: 12 } }, " 16 "))),
                        react_1.default.createElement(IconButton_1.default, null,
                            react_1.default.createElement(material_1.Stack, { alignItems: "center", spacing: 1, direction: "row" },
                                react_1.default.createElement(Headphones_1.default, { style: { width: 20, height: 20 } }),
                                react_1.default.createElement("label", { style: { fontSize: 12 } }, " 16 "))))),
                react_1.default.createElement(material_1.Box, null,
                    react_1.default.createElement(material_1.Stack, { alignItems: "center", spacing: 1, direction: "row" },
                        react_1.default.createElement("label", { style: { fontSize: 12, color: "grey" } }, " File: "),
                        react_1.default.createElement(IconButton_1.default, null,
                            react_1.default.createElement(material_1.Stack, { alignItems: "center", spacing: 1, direction: "row" },
                                react_1.default.createElement(PictureAsPdf_1.default, { style: { width: 20, height: 20 } }),
                                react_1.default.createElement("label", { style: { fontSize: 12 } }, " 16 "))),
                        react_1.default.createElement(IconButton_1.default, null,
                            react_1.default.createElement(material_1.Stack, { alignItems: "center", spacing: 1, direction: "row" },
                                react_1.default.createElement(Description_1.default, { style: { width: 20, height: 20 } }),
                                react_1.default.createElement("label", { style: { fontSize: 12 } }, " 16 "))),
                        react_1.default.createElement(IconButton_1.default, null,
                            react_1.default.createElement(material_1.Stack, { alignItems: "center", spacing: 1, direction: "row" },
                                react_1.default.createElement(InsertDriveFile_1.default, { style: { width: 20, height: 20 } }),
                                react_1.default.createElement("label", { style: { fontSize: 12 } }, " 16 "))))),
                react_1.default.createElement(material_1.Box, null,
                    react_1.default.createElement(material_1.Stack, { alignItems: "center", spacing: 1, direction: "row" },
                        react_1.default.createElement("label", { style: { fontSize: 12, color: "grey" } }, " Links: "),
                        react_1.default.createElement(IconButton_1.default, null,
                            react_1.default.createElement(material_1.Stack, { alignItems: "center", spacing: 1, direction: "row" },
                                react_1.default.createElement(Link_1.default, { style: { width: 20, height: 20 } }),
                                react_1.default.createElement("label", { style: { fontSize: 12 } }, " 16 "))),
                        react_1.default.createElement(IconButton_1.default, null,
                            react_1.default.createElement(material_1.Stack, { alignItems: "center", spacing: 1, direction: "row" },
                                react_1.default.createElement(FindInPage_1.default, { style: { width: 20, height: 20 } }),
                                react_1.default.createElement("label", { style: { fontSize: 12 } }, " 16 ")))))))));
};
exports.default = ChatTopBar;
//# sourceMappingURL=chatTopBar.js.map