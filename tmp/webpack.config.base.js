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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var webpack_1 = require("webpack");
var mini_css_extract_plugin_1 = __importDefault(require("mini-css-extract-plugin"));
var dotenv = __importStar(require("dotenv"));
dotenv.config({ path: __dirname + "/.env" });
var config = {
    mode: "development",
    entry: "./client/apps/management/index.tsx",
    output: {
        filename: "main.js",
        publicPath: "/",
    },
    // webpack 5 comes with devServer which loads in development mode
    devServer: {
        port: 3001,
        historyApiFallback: true,
    },
    // Rules of how webpack will take our files, complie & bundle them for the browser
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            configFile: "tsconfig.management.json",
                        },
                    },
                ],
            },
            {
                test: /\.scss|\.css$/,
                use: [
                    // fallback to style-loader in development
                    mini_css_extract_plugin_1.default.loader,
                    "css-loader",
                    "sass-loader",
                ],
            },
            {
                test: /\.(jpg|png)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[path][name].[ext]",
                        },
                    },
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg)$/,
                use: [
                    {
                        loader: "url-loader?limit=100000",
                        options: {
                            name: "[name].[ext]",
                            esModule: false,
                        },
                    },
                ],
            },
            {
                test: /\.ico$/,
                loader: "file-loader",
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
        new mini_css_extract_plugin_1.default({
            filename: "[name].css",
            chunkFilename: "[id].css",
        }),
        new webpack_1.DefinePlugin({
            API_BASE_URL: JSON.stringify(process.env.API_BASE_URL),
            ENV: JSON.stringify(process.env.ENV),
        }),
    ],
};
exports.default = config;
//# sourceMappingURL=webpack.config.base.js.map