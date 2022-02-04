"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var html_webpack_plugin_1 = __importDefault(require("html-webpack-plugin"));
var webpack_1 = require("webpack");
var webpack_config_base_1 = __importDefault(require("../../../webpack.config.base"));
webpack_config_base_1.default.entry = "./client/apps/template/src/index.tsx";
webpack_config_base_1.default.output.path = path_1.default.resolve(__dirname, "../../../public/template");
webpack_config_base_1.default.plugins.push(new html_webpack_plugin_1.default({ template: "./client/apps/template/src/index.html" }));
webpack_config_base_1.default.output.publicPath = "/template";
webpack_config_base_1.default.plugins.push(new webpack_1.DefinePlugin({
    BASE_URL: JSON.stringify("/template"),
}));
exports.default = webpack_config_base_1.default;
//# sourceMappingURL=webpack.config.prod.js.map